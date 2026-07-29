---
title: "Building an Autonomous LLM Agent That Cannot Lie About Your Resume"
description: "A local-model resume agent built around one constraint: every claim it makes must be traceable to the source document, enforced in the schema rather than the prompt."
date: May 25, 2026
category: AI
---

*Three-layer skill matching, verbatim enforcement in Pydantic, and why the whole
thing runs on a model on my own machine.*

---

Tailoring a resume for each application is repetitive enough to automate and
dangerous enough that most automation makes it worse. Ask a capable model to
"improve this resume for this job" and it will happily hand back a stronger
candidate than the one who uploaded it: an invented metric here, a framework you
have never touched there, all fluent, all plausible, all a liability in an
interview you now cannot pass.

So [Resume Agent](https://github.com/boazleleina/resume_agent) is built around
one constraint: **the agent may reorganize and rephrase what is there, and it may
not add anything that is not.** Not as a prompt instruction, which is a
suggestion, but as a structural property enforced after the model has spoken.

---

## Why the model runs locally

The obvious build is a hosted frontier model. I run [Ollama](https://ollama.ai)
with `qwen3:30b-a3b` instead, for three reasons.

**A resume is a PII packet.** Full name, phone, home city, employment history,
sometimes visa status. Uploading that to a third-party API to reformat bullet
points is a bad trade, and it is a trade the user cannot see me making.

**Iteration cost goes to zero.** The prompts in this system got rewritten dozens
of times. Metered per-token iteration quietly biases you toward shipping the
first prompt that works. Local iteration does not.

**The MoE architecture makes it viable.** Qwen3 30B-A3B is mixture-of-experts
with roughly 3B active parameters, so it reasons like a 32B-class model while
generating at small-model speed. That is what makes a multi-step pipeline on a
laptop tolerable rather than a demo you run once.

The cost is honest: it needs about 19GB of weights and 32GB of unified memory,
and it is slower than an API call. Model choice is environment-overridable
(`LLM_EXTRACTION_MODEL`, `LLM_GRADING_MODEL`) precisely so that trade stays the
user's to make.

---

## Architecture

Domain-driven layering, with the LLM confined to the outer edge:

```
app/
├── domain/          # Pure logic. No FastAPI, no HTTP, no LLM.
│   ├── validation.py       magic-byte file checks
│   ├── classification.py   is this actually a resume?
│   ├── resume_models.py    canonical schema + VERBATIM enforcement
│   ├── jd_models.py        structured job-description schema
│   └── jd_parsing.py       4-layer JD extraction pipeline
├── parsers/         # pdfplumber / python-docx behind a registry
├── services/
│   ├── resume_service.py   validate → parse → classify
│   ├── jd_service.py       fetch (SSRF-guarded) → clean
│   └── llm/
│       ├── base.py         provider-agnostic ABC
│       ├── ollama_client.py
│       ├── factory.py      provider registry
│       ├── cache.py        two-layer response cache
│       ├── extraction.py   step 1
│       ├── matching.py     step 2
│       ├── grading.py      step 3
│       └── prompts.py      every prompt string, one file
└── routes.py        # thin FastAPI transport, no business logic
```

The rule that pays off repeatedly: **`domain/` knows nothing about the LLM.**
Verbatim enforcement, document classification, and JD extraction are all pure
functions over strings, testable without a model running. Of the 40 tests in the
suite, most never start Ollama.

The pipeline runs in three LLM steps over a canonical intermediate
representation:

```
resume file ──▶ parse ──▶ extraction ──┐
                                       ├──▶ matching ──▶ grading ──▶ edits
JD text/URL ──▶ fetch ──▶ extraction ──┘
```

---

## Step 0: refusing bad input before it costs anything

Two cheap gates run before a model is ever loaded.

**Magic bytes, not file extensions.** A `.pdf` extension is a claim by the
uploader, not a fact:

```python
def is_safe_file_type(file_bytes: bytes, ext: str) -> bool:
    if ext == "pdf":
        return file_bytes.startswith(b"%PDF-")
    elif ext == "docx":
        # DOCX files are zip archives, which always start with PK
        return file_bytes.startswith(b"PK")
    return False
```

**Is this even a resume?** Users upload cover letters. Two-sided heuristic
scoring catches it without an LLM call:

```python
cl_hits = sum(1 for marker in cover_letter_markers if marker in text_lower)
score -= (cl_hits * 5)

if score <= -5:
    return "cover_letter"

r_hits = sum(1 for marker in resume_markers if marker in text_lower)
score += r_hits

if score >= 3:
    return "resume"
elif score > 0:
    return "uncertain"
return "other_document"
```

Cover-letter signals are weighted 5x against resume signals, because "Dear Hiring
Manager" is near-conclusive while the word "experience" is weak evidence. The
`uncertain` bucket exists so the system can proceed with a warning rather than
force a binary call it cannot justify.

---

## Step 1: a canonical resume that cannot be inflated

Extraction turns the parsed text into a `CanonicalResume` Pydantic model. Every
field is annotated as one of two kinds:

```python
VERBATIM_DESC = (
    "VERBATIM: Must copy exactly from source text. If no information is found "
    "naturally, leave as null. Do not invent or summarize."
)
MUTABLE_DESC = "MUTABLE: Can be modified or formulated by the agent."
```

Company names, titles, institutions, certifications, and extracted metrics are
VERBATIM. Bullets and summaries are MUTABLE, because rephrasing them is the
entire point of the product.

The annotation is documentation. The enforcement is a `model_validator` that runs
after construction and checks VERBATIM fields against `raw_text`, the immutable
parsed source stored on the model itself:

```python
@model_validator(mode='after')
def enforce_verbatim_against_raw_text(self) -> 'CanonicalResume':
    if not self.raw_text or not self.raw_text.strip():
        return self

    raw_lower = self.raw_text.lower()
    raw_normalized = _normalize_for_comparison(self.raw_text)

    # Strict tier: strip anything not found in the source
    self._check_list_strict('metrics_found', raw_lower)
    self._check_list_strict('certifications', raw_lower)

    if self.skills and self.skills.all_terms:
        filtered = _strip_section_headers(self.skills.all_terms)
        clean, invented = self._partition_list(filtered, raw_lower)
        if invented:
            logger.warning(
                f"VERBATIM violation in skills.all_terms "
                f"({len(invented)} of {len(filtered)} stripped): {invented}"
            )
        object.__setattr__(self.skills, 'all_terms', clean)
```

**This is the load-bearing idea of the project.** A prompt saying "do not invent
skills" is advice. A validator that deletes invented skills is a guarantee. If
the model hallucinates `Kubernetes` into the skills list of a resume that never
mentions it, the term is stripped and logged before any downstream stage sees it,
and a hallucinated skill that never reaches the matcher can never be reported as
a match.

Three implementation details that took real debugging:

**Tiered strictness, because uniform strictness is unusable.** Not every field
can be substring-matched. Dates are the clearest case: `Jan 2024`, `January
2024`, and `01/2024` are all faithful renderings of the same source. Flagging
those as hallucinations trains everyone to ignore the warnings.

| Tier | Fields | Behavior |
|---|---|---|
| Strict, strip | `metrics_found`, `certifications`, `skills.all_terms` | Remove unverifiable items, log |
| Strict, log only | `experience[].company/title`, `education[].institution/degree`, `projects[].name` | Log; stripping would crash a required field |
| Lenient | `contact.name`, `contact.location` | Compare after punctuation/whitespace normalization |
| Skipped | emails, phones, links, all dates, GPA | Format-dependent; better validated with regex than substring |

Required non-nullable fields are logged rather than stripped, because nulling
them would fail validation and take down the request. That is a deliberate
choice to keep the guarantee strong where it is cheap and observable where it is
not.

**`object.__setattr__`, not plain assignment.** The model sets
`validate_assignment=True` so that post-construction mutation re-triggers
validation, which is what stops code from bypassing the verbatim check by
mutating the object afterwards. But that means assigning inside the validator
re-enters the validator. `object.__setattr__` writes through without the
recursion.

**Section headers leak.** PDF text extraction happily turns a skills-section
heading into a skill. `Technical Skills`, `Languages & Frameworks`, and
`Cloud & MLOps` all pass the verbatim check, because they genuinely appear in the
source, and are all nonsense as skills. A regex filter strips them before the
verbatim pass. Truthfulness and usefulness are different properties, and this
system needs both.

---

## Step 2: three-layer skill matching

Keyword matching between a resume and a job description fails in a specific,
frustrating way. The JD says `client relations`, the resume says
`customer service`. The JD says `CI/CD`, the resume says `GitHub Actions`. Both
are matches. No amount of string comparison finds them.

Handing the whole problem to the LLM fails differently: it volunteers matches
that do not exist, and you have no way to tell which verdicts were real.

So matching runs in three layers, cheapest first:

```python
# Layer 1: exact match (after alias normalization)
exact_matched = resume_skills & all_jd_skills

# Layer 2: fuzzy match on still-unmatched JD terms
fuzzy_matched = _fuzzy_match(all_jd_skills - exact_matched, resume_skills)

matched = exact_matched | fuzzy_matched

# Layer 3: LLM semantic adjudication on terms that survived exact + fuzzy
still_unmatched = all_jd_skills - matched
semantic_match_details = await _semantic_match(still_unmatched, resume_skills)
matched |= set(semantic_match_details)
```

Layers 1 and 2 are deterministic set operations, with `rapidfuzz`
`token_sort_ratio` at threshold 85 catching word-order and minor spelling
variance. Layer 0, before either, is a **frozen** alias map for genuinely
ambiguous short tokens (`k8s`, `tf`, `js`) plus compound expansion, so
`"AWS (EC2, S3)"` normalizes to `aws` and `"JavaScript/TypeScript"` splits into
two terms. That map is explicitly not a synonym dictionary. Maintaining synonyms
by hand does not scale and never covers the non-technical half of the job market;
that is the semantic layer's job.

### Making the LLM layer structurally honest

The semantic layer only ever sees terms that already failed deterministic
matching, so its input is small and its cost is bounded. Two properties make its
output trustworthy:

**Forced per-term enumeration.** The model must return a verdict for every
unmatched JD term, with `covered_by` set to a resume skill or explicitly
`null`. Asking "which of these match?" invites both laziness (empty output) and
enthusiasm (volunteered matches). Asking for a verdict on each term individually
invites neither.

**Every verdict is validated against the inputs:**

```python
for v in parsed.get("verdicts", []):
    jd_term = v.get("jd_term")
    covered_by = v.get("covered_by")
    if not covered_by:
        continue  # explicit non-match verdict
    if jd_term in jd_terms and covered_by in resume_skills:
        result[jd_term] = {"covered_by": covered_by, "reason": v.get("reason", "")}
        logger.info(f"Semantic match: '{jd_term}' <- '{covered_by}'")
    else:
        logger.warning(f"Discarded hallucinated semantic match: {v}")
```

A verdict naming a JD term that was not sent, or a resume skill the candidate
does not have, is discarded and logged. **Hallucinated matches are not unlikely
here, they are unrepresentable.** The output set is a subset of the input set by
construction.

And the layer never fails a request:

```python
except Exception as e:
    logger.warning(f"Semantic matching unavailable, falling back to fuzzy-only: {e}")
    return {}
```

Ollama down, JSON malformed, timeout: matching degrades to exact-plus-fuzzy and
the pipeline continues with a slightly worse answer instead of an error page.

### Prose is not a keyword

One more split, before any matching runs:

```python
PROSE_WORD_THRESHOLD = 5

def _split_prose(terms: list[str]) -> tuple[list[str], list[str]]:
    """Separate keyword terms from prose sentences by word count."""
    keywords = [t for t in terms if len(t.split()) <= PROSE_WORD_THRESHOLD]
    prose = [t for t in terms if len(t.split()) > PROSE_WORD_THRESHOLD]
    return keywords, prose
```

JD extraction returns a mix of `PostgreSQL` and `Proven ability to work
independently in ambiguous environments`. String-matching the second one scores
0% forever and drags the overall match percentage down for no reason. Prose
requirements skip matching entirely and go straight to the grader as qualitative
input. A metric that is wrong in a known direction is worse than no metric,
because people trust the number.

---

## Step 3: grading, with the answer key attached

The grader gets the canonical resume, the JD, **and the pre-computed match
results**, with the matched sets explicitly labeled:

```
- Matched skills (confirmed present — do NOT list these as gaps): [...]
- Fuzzy-matched skills (close enough — do NOT list these as gaps): [...]
- Semantically-matched skills (equivalent or implied — do NOT list these as gaps): [...]
- Missing required: [...]
- Missing competencies (practices recruiters scan for, e.g. microservices, DevOps): [...]
```

The model is not asked to decide what is missing. That was settled
deterministically one step earlier. It is asked to reason about *significance*:
which gaps matter for this role, what the resume under-sells, what to change.
Narrowing the model's job to the part that actually needs judgment is most of
what makes the output reliable.

### Traceability tags, and the post-processor that enforces them

Every proposed edit must carry one of five tags:

1. `supported by source text`
2. `formatting improvement`
3. `generic strengthening suggestion`
4. `missing but unverifiable, ask user to supply`
5. `already present in resume, rephrase for emphasis`

Tag 4 is the one that matters. If you have no quantified outcome for a bullet,
the agent is structurally forbidden from inventing one; it must ask you to supply
it. That single rule is the difference between a tool that improves your resume
and a tool that writes you a resume you have to defend.

Self-tagging by the model is not trusted either. A post-pass re-checks both
directions:

```python
for edit in grading.top_3_edits:
    if edit.traceability == "supported by source text":
        if not _suggestion_has_evidence(edit.suggestion.lower(), resume_lower):
            logger.warning(...)
            edit.traceability = "missing but unverifiable, ask user to supply"

    elif edit.traceability in (
        "missing but unverifiable, ask user to supply",
        "generic strengthening suggestion",
    ):
        already_present = _suggestion_names_present_skills(edit.suggestion, resume_lower)
        if already_present:
            logger.warning(...)
            edit.traceability = "already present in resume — rephrase for emphasis"
```

The evidence check looks for any 3+ word phrase from the suggestion in the
source text. The reverse check extracts capitalized tokens (likely technology
names), filters sentence-starters and short words, and catches the grader
suggesting you "add Docker" to a resume that already lists Docker. Both are
crude, zero-cost heuristics, and the code says so. They run in the direction that
fails safe: a claim of support is downgraded when unproven, never upgraded.

---

## Provider abstraction and caching

`base.py` defines one method:

```python
async def prompt_model(system, user, think=False, model_role="extraction") -> str
```

Two parameters, deliberately independent. `model_role` picks which configured
model handles the call; `think` toggles reasoning mode. Decoupling them means the
large model can run fast without thinking or slow with it, per step, without any
pipeline code changing. Grading and matching each have their own
`LLM_*_THINK` flag, both defaulting off, because reasoning mode adds one to two
minutes per call and is not worth it for structured extraction.

Adding a provider is one file plus one `_REGISTRY` entry in `factory.py`.
Extraction, matching, and grading are untouched by it. Both models default to
`qwen3:30b-a3b` for an unglamorous operational reason: pointing the roles at
different models made Ollama evict and reload 18GB weights on every role switch,
stalling the pipeline for minutes. One resident model with
`OLLAMA_KEEP_ALIVE=30m` removed the stall entirely.

Caching is two-layer: an in-memory L1 (zero latency, lost on restart) over a
`shelve` L2 on disk with a 7-day TTL, promoting L2 hits back into L1. Each
pipeline step caches independently, and the key covers everything that could
change the answer:

```python
key = cache_key(
    "semantic_match",
    LLM_EXTRACTION_MODEL,
    str(LLM_MATCHING_THINK),
    SEMANTIC_MATCHING_SYSTEM,   # the prompt text itself
    json.dumps(sorted(jd_terms)),
    json.dumps(sorted(resume_skills)),
)
```

Including the **prompt text** in the key is the detail worth stealing. Prompt
iteration is the main development loop of a system like this, and a cache keyed
only on inputs will confidently serve you answers from a prompt you edited an
hour ago. Here, editing a prompt self-invalidates exactly the entries it should.

Sorted term lists mean set ordering never produces a spurious miss.

---

## What is done, and what is not

Working: upload, parse, classify, canonical extraction with verbatim
enforcement, 4-layer JD resolution, three-layer matching, grading, and traceable
recommendations, behind FastAPI with a Streamlit frontend that streams progress
over server-sent events.

Not yet: the human-review approval UI, and stateless ATS-friendly PDF
regeneration from the canonical JSON plus approved patches. Those are v2, and
the architecture was shaped for them: the canonical JSON is the single source of
truth precisely so regeneration never has to replay the pipeline.

---

## The general lesson

The interesting problem in an LLM product is rarely the prompt. It is deciding
which parts of the job the model is allowed to have.

Here, the model does exactly three things: read a document into a schema, judge
equivalence between two short lists of terms, and reason about significance.
Everything else, whether a file is safe, whether a term matches, whether a claim
has evidence, whether a suggestion is redundant, is deterministic code that runs
before or after the model and can overrule it.

That is what makes the guarantee real. Not "the prompt says not to hallucinate,"
but "a hallucinated skill is deleted by a validator, a hallucinated match is
discarded by a set membership check, and an unsupported claim is re-tagged by a
post-processor." Prompts are how you ask. Schemas and set operations are how you
enforce.

Code on [GitHub](https://github.com/boazleleina/resume_agent).

**Stack:** Python · FastAPI · Streamlit · Pydantic v2 · Ollama (Qwen3 30B-A3B) · pdfplumber · python-docx · trafilatura · BeautifulSoup · rapidfuzz · pytest.
