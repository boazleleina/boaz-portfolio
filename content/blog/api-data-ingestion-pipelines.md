---
title: "Designing Resilient Third-Party Ingestion Pipelines"
description: "SSRF guards, streaming size caps, layered extraction, and an error taxonomy that tells the user what to do next, drawn from a pipeline that ingests job postings from arbitrary URLs."
date: May 10, 2026
category: APIs
---

*What it takes to accept a URL from a user and turn it into structured data
without trusting the URL, the server, or the HTML.*

---

Pulling data from a third party is a staple of backend work, and the naive
version is four lines that work on your machine and fail in production:

```python
response = requests.get(url)
data = response.json()
```

That code trusts the URL, trusts the host to be reachable, trusts the payload to
be small, and trusts the response shape to be stable. Every one of those is a
failure mode with its own blast radius, and the difference between a prototype
and a production ingestion client is almost entirely in how each is handled.

The examples here come from the job-description ingestion path in
[Resume Agent](https://github.com/boazleleina/resume_agent), which takes an
arbitrary URL from a user, fetches it, and extracts a clean job posting from
whatever HTML comes back. It is a good case study because every hostile
condition is normal there: the URL is user-supplied, the sites actively block
scrapers, and the HTML is written by whoever built that company's careers page.

---

## 1. The input is not trusted, and neither is the destination

The moment a user supplies a URL that your server fetches, you have built a
**server-side request forgery** primitive unless you take it away. Your backend
sits inside a network the user cannot reach. If they hand you
`http://169.254.169.254/latest/meta-data/` and you dutifully fetch it, you have
turned your service into a proxy for the cloud metadata endpoint.

Validation happens before any client is constructed:

```python
def is_valid_url(text: str) -> bool:
    text = text.strip()
    if not (text.startswith("http://") or text.startswith("https://")):
        return False

    if " " in text or "\n" in text:
        return False

    try:
        result = urllib.parse.urlparse(text)
        if not all([result.scheme, result.netloc]):
            return False

        domain = result.netloc.split(':')[0].lower()

        # Block explicit local hostnames
        if domain in ("localhost", "local", "invalid", "test"):
            return False

        # Block explicit private IPs
        try:
            ip = ipaddress.ip_address(domain)
            if ip.is_private or ip.is_loopback or ip.is_link_local:
                return False
        except ValueError:
            pass  # not an IP literal, so it's a domain name

        return True
    except ValueError:
        return False
```

Three things worth pulling out.

**Scheme allowlisting, not denylisting.** Only `http://` and `https://` pass.
Without that, `file:///etc/passwd` and `gopher://` are on the table.

**`ipaddress` instead of regex.** Hand-rolled private-range regexes miss
`0177.0.0.1`, `2130706433`, and IPv6 loopback. The standard library knows the
address families; use it.

**The whitespace check is a routing decision, not a security one.** This
function also decides whether the user pasted a URL or pasted text that happens
to begin with one. A paragraph starting with `https://…` must not be routed to
the HTTP client. Rejecting anything containing whitespace makes that
unambiguous.

This validation is genuinely partial, and it is worth being precise about the
gap: a hostname that resolves to a private address defeats it, because the check
runs on the string, not on the resolved IP. Closing that means resolving first
and validating the resolved address, which also means handling DNS rebinding
between your check and the connection. For an internal-facing tool the string
check is a reasonable floor. For anything public, it is not the whole answer, and
pretending otherwise is how these bugs ship.

---

## 2. Nothing gets to decide how much memory you use

`response.content` is an unbounded write into your process. A 4GB response from a
misconfigured or malicious host is an OOM kill, and it is the cheapest denial of
service available against an ingestion service.

The fix is to stream and check as you go:

```python
MAX_PAYLOAD_SIZE = 5 * 1024 * 1024  # 5 MB

async with httpx.AsyncClient(timeout=5.0) as client:
    async with client.stream("GET", input_data.strip()) as response:
        response.raise_for_status()

        # Check the header first, when the server bothers to send one
        content_length = response.headers.get("Content-Length")
        if content_length and int(content_length) > MAX_PAYLOAD_SIZE:
            raise JobDescriptionException("URL payload exceeds the 5MB safe memory limit.")

        # Drain chunk by chunk, checking the running total
        html_bytes = b""
        async for chunk in response.aiter_bytes():
            html_bytes += chunk
            if len(html_bytes) > MAX_PAYLOAD_SIZE:
                raise JobDescriptionException(
                    "URL payload stream exceeded the 5MB safe memory limit. Aborting."
                )

html_content = html_bytes.decode('utf-8', errors='ignore')
```

**Both checks are necessary.** `Content-Length` is an optimization: when it is
present and honest, you abort before transferring anything. It is absent on
chunked responses and can simply be a lie, so the running total inside the loop
is the check that actually enforces the bound. Trusting the header alone is the
common version of this bug.

**The timeout is a wall-clock budget, not a per-read one.** Five seconds is
aggressive on purpose: this fetch is inline with a user request, and a request
hanging for 30 seconds is indistinguishable from a broken product. A background
batch job would justify a very different number, but the number should always be
chosen against what is waiting on it.

**`errors='ignore'` on decode is a considered surrender.** Mislabeled encodings
are routine on the open web. A `UnicodeDecodeError` fails the whole job posting
because of one bad byte in a footer. Dropping the byte costs a character in text
that is about to be regex-processed anyway.

---

## 3. One source is not a source

Having fetched the HTML, extraction is where most pipelines quietly lose data.
Pick a single strategy and each one fails somewhere specific:

- **Structured data (JSON-LD)** is the cleanest possible source, and plenty of
  sites do not emit it.
- **Readability-style extraction** is excellent at prose and prunes exactly the
  dense requirement lists you need, because they look like navigation chrome.
- **Manual DOM walking** catches structure that pruning drops, and drags in
  noise.

So run all three and merge:

```python
def extract_text_from_html(html_content: str) -> str:
    # Layer 1: structured JSON-LD JobPosting, when present
    jsonld_text = _extract_jsonld_description(html_content)

    # Layer 2: Trafilatura in recall mode (greedy, keeps more)
    trafilatura_text = _extract_trafilatura_recall(html_content)

    # Layer 3: BS4 heading walker (catches stacked requirement lists)
    bs4_text = _extract_bs4_heading_sections(html_content)

    # Layer 4: merge and deduplicate
    final_text = _merge_and_deduplicate(jsonld_text, trafilatura_text, bs4_text)
```

**Layer 1** looks for `<script type="application/ld+json">` blocks with
`@type: JobPosting`, which LinkedIn, Indeed, and Greenhouse all emit. When it
hits, it is the highest-quality text available, though its `description` field
usually contains raw HTML that needs stripping.

**Layer 2** runs Trafilatura with `favor_recall=True` and
`include_formatting=True`. Recall mode is the important flag: the default
optimizes precision, which for a job posting means confidently deleting the
"Requirements" list.

**Layer 3** walks every `h1`–`h6` and collects siblings until the next heading:

```python
for heading in soup.find_all(heading_tags):
    section_lines = [heading.get_text(strip=True)]

    for sibling in heading.next_siblings:
        if hasattr(sibling, 'name') and sibling.name in heading_tags:
            break   # next heading, section over
        ...
        section_lines.append(text)

    if len(section_lines) > 1:   # keep only sections with content
        sections.append('\n'.join(section_lines))
```

`script`, `style`, `nav`, `footer`, and `noscript` are decomposed first. This
layer exists because of stacked headings, where `Requirements` is an `h2`
immediately followed by an `h3` and then the list. Generic extractors regularly
drop that middle band.

**Layer 4** is what makes running three overlapping extractors affordable.
Deduplication normalizes formatting noise before comparing, so the same line
does not survive three times in three different styles:

```python
text = re.sub(r'^\s*[-*•]\s+', '', text)   # leading bullets
text = re.sub(r'^\s*\d+\.\s+', '', text)   # numbered lists
text = text.replace('**', '').replace('__', '')
return text.strip().lower()
```

Comparison happens on the normalized form; the **first occurrence's original
formatting** is what gets kept. You get deduplication without flattening the
document.

The design principle generalizes past HTML: when no single extraction strategy is
reliable, run several with different failure modes and reconcile. The cost is one
normalization function, and it buys you tolerance for sources you have never
seen.

---

## 4. An error taxonomy the caller can act on

Ingestion fails constantly, and lumping every failure into one exception throws
away the only information the user needs, which is what to do next.

Failures are typed by what the user should do, not by which library raised:

```python
except httpx.HTTPStatusError as e:
    raise ScrapingBlockedException(
        "We couldn't access that job posting — the site blocked automated access. "
        "Copy the job description text from the page and paste it directly into the field."
    )
except (httpx.TimeoutException, httpx.ConnectError):
    raise ScrapingBlockedException(
        "We couldn't reach that URL — the site may be down or blocking requests. "
        "Copy the job description text from the page and paste it directly into the field."
    )
except httpx.HTTPError:
    raise ScrapingBlockedException(
        "We couldn't load that job posting. "
        "Copy the job description text from the page and paste it directly into the field."
    )
```

`ScrapingBlockedException` subclasses `JobDescriptionException`, which subclasses
the app's base error, and the route layer maps it to HTTP 422 with the message
intact. Three distinct technical causes collapse to one user-facing category
because **the remedy is identical in all three: paste the text instead.** The
distinction that matters to a user is not `TimeoutException` versus
`HTTPStatusError`, it is "your input was wrong" versus "this source is
unavailable, here is the way around it."

The same exception is raised from a fourth place, after a completely successful
fetch:

```python
final_text = _merge_and_deduplicate(jsonld_text, trafilatura_text, bs4_text)

if not final_text:
    raise ScrapingBlockedException(
        "We couldn't extract text from that page — it may load content dynamically "
        "with JavaScript. Copy the job description text from the page and paste it directly."
    )
```

HTTP 200, valid HTML, zero content, because the page renders client-side. **A
successful fetch is not a successful ingestion.** Any pipeline that treats 2xx as
the success condition will happily store empty records and report a green
dashboard. Validate the payload, not the status code.

---

## 5. Always leave a manual path

Every error message above ends with the same sentence: paste the text directly.

That is not a copywriting tic, it is an architectural decision. Some sites will
always block you, some will always be JavaScript-only, and some will break
tomorrow in a way you cannot anticipate. A pipeline whose only input path is
automated has a hard ceiling on reliability set by the least cooperative source
you support.

The URL path here is an *optimization* over the text path. Raw text still goes
through the same normalization:

```python
if not is_valid_url(input_data):
    clean_raw = html.unescape(input_data)        # &nbsp; → space
    clean_raw = clean_raw.replace("\r\n", "\n")  # strip carriage returns
    return clean_raw.strip()
```

Everything downstream, extraction and matching and grading, sees identical input
either way. So the fetch path can fail completely without taking the product with
it.

---

## Patterns this pipeline does not need, and when you will

Two things belong in this discussion and are deliberately absent from this
codebase, because a single interactive page fetch does not justify them.

**Retry with exponential backoff.** When an API throttles you with HTTP 429, the
correct response is to wait and retry with a growing delay, ideally honoring
`Retry-After` when the server sends it. Two rules make the difference between
backoff that helps and backoff that hurts: only retry *idempotent* operations,
since a retried non-idempotent POST is a duplicate write, and add jitter so a
fleet of clients backing off in lockstep does not synchronize into a thundering
herd. Note also that this pipeline runs inline with a user request; a 5-second
budget does not have room for four backoff rounds. Retries belong in the
background jobs, not the interactive path.

**Incremental writes for large collections.** Accumulating an entire paginated
result set in a list before writing means peak memory scales with the dataset. A
generator that yields each page, with the consumer writing as it goes, keeps
memory flat and makes partial progress durable when the run dies at page 400 of
900. The same instinct as the streaming size cap above: never let an external
party's data volume determine your resident set size.

---

## Takeaways

The four-line version of this pipeline is not wrong because it is short. It is
wrong because every line contains an act of trust it never states:

| Trust | What replaces it |
|---|---|
| The URL points somewhere safe | Scheme allowlist plus private-IP rejection, before the client exists |
| The response is small | Streaming with a running byte cap, header as an optimization only |
| The response arrives | Aggressive timeout, chosen against what is waiting |
| One parser is enough | Layered extraction with reconciliation and dedupe |
| HTTP 200 means success | Validate the payload; empty output is a failure |
| Automation will work | A manual path that reaches the same downstream code |

None of it is difficult. It is all the work of noticing what you assumed, and
what it would cost you when the assumption is false.

**Stack:** Python · httpx (async streaming) · trafilatura · BeautifulSoup · FastAPI.
