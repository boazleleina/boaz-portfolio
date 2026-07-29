---
title: "Building a Local Token Usage Tracker for LLM API Spend"
description: "A zero-dependency observability tool that captures live telemetry across Claude Code, Gemini/Antigravity, and custom scripts, using nothing but the Python standard library."
date: June 13, 2026
category: AI
---

*Why a push receiver beats a polling loop, what prompt caching does to your token
math, and how to pull exact usage out of a local language server.*

---

LLM API spend is deceptively opaque. Across a normal week I bounce between Claude
Code, Gemini via Antigravity, and a handful of custom scripts, each with its own
pricing, its own token accounting, and its own caching rules. By the time a bill
lands, there is no easy way to answer the simple question: *where did the tokens
go?*

So I built [Token Usage Tracker](https://github.com/boazleleina/token-tracker), a
local observability tool that captures spend in real time, across every source,
using nothing but the Python standard library.

---

## Two constraints that shaped everything

**Local only.** Prompt contents are sensitive. Shipping telemetry to a
third-party SaaS just to learn how many tokens I spent trades one problem for a
worse one. Every byte stays on the machine, and every listener binds to
`127.0.0.1` rather than `0.0.0.0`.

**Zero external dependencies.** No `pip install` archaeology a year from now.
Receiver, daemon, and dashboard run on `http.server`, `json`, and `shelve`-free
flat files. It runs anywhere Python 3.10+ does, with no install step at all.

Those two rules cost something. There is no database, so aggregation happens by
re-reading a log file on every dashboard request. There is no OTEL SDK, so the
OTLP envelope gets unwrapped by hand. Both were the right trade at this size, and
I'll show where each one strains.

---

## The shape of the system

Four processes, one file, no coordination between them:

```
       Claude Code session                 Antigravity / Gemini
       (any project, global config)        language_server (local)
                 │                                   │
                 │ OTLP/HTTP push, every 5s          │ RPC poll, every 30s
                 ▼                                   ▼
       otel_receiver.py :4318              ingest_antigravity_rpc.py
       POST /v1/logs                       (driven by tracker_daemon.py)
                 │                                   │
                 └──────────────┬────────────────────┘
                                ▼
                       token_usage.log          ◀── token_logger.py
                       (JSON lines)                 (generic adapter)
                                │
                                │ read + aggregate
                                ▼
                       dashboard_server.py :7823
                       /api/stats + dashboard.html
```

Every writer appends JSON lines to one file. Nothing shares memory, nothing needs
a broker, and any component can be restarted without the others noticing. The
append-only log is the entire integration contract.

| File | Role |
|---|---|
| `otel_receiver.py` | OTLP/HTTP server on `:4318`. Receives Claude Code telemetry pushes. |
| `dashboard_server.py` | HTTP server on `:7823`. Aggregates the log, serves the UI. |
| `token_logger.py` | Shared library. Generic `log_usage()` plus the `_append_log()` all writers use. |
| `ingest_antigravity_rpc.py` | Pulls exact Gemini usage from Antigravity's local RPC. |
| `tracker_daemon.py` | Background loop running the RPC ingest every 30s. |
| `ingest_claude_code.py` | Backfill tool for `~/.claude/projects/*/*.jsonl` transcripts. |

---

## Push, not poll

The first version scanned Claude Code's JSONL transcripts on a timer. That works,
and it survives as `ingest_claude_code.py` for one-off backfills, but polling a
transcript file has three problems: you are always a poll interval behind, you
re-read the same bytes repeatedly, and you have to dedupe by request ID because
the file keeps growing under you.

Claude Code emits native OpenTelemetry. Turning it on is config, not code:

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_LOGS_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/json",
    "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:4318",
    "OTEL_LOGS_EXPORT_INTERVAL": "5000",
    "OTEL_LOG_USER_PROMPTS": "1"
  }
}
```

Set globally in `~/.claude/settings.json`, so every session in every project
reports without per-project setup. The receiver is a `ThreadingHTTPServer` that
accepts `POST /v1/logs` and always answers `200`:

```python
class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)

        if self.path.rstrip("/").endswith("/v1/logs"):
            try:
                payload = json.loads(body)
                for rl in payload.get("resourceLogs", []):
                    resource_attrs = _flatten_attrs(rl.get("resource", {}).get("attributes"))
                    for sl in rl.get("scopeLogs", []):
                        for rec in sl.get("logRecords", []):
                            _handle_log_record(rec, resource_attrs)
            except (json.JSONDecodeError, KeyError, TypeError) as e:
                print(f"[otel] parse error: {e}", flush=True)

        # Always 200 so the exporter doesn't retry/backoff.
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"{}")
```

**The unconditional `200` is deliberate.** An OTLP exporter treats non-2xx as a
failure and starts backing off, which would degrade the thing being measured. A
telemetry sink should never apply backpressure to the workload it observes. If my
parser has a bug, that is my problem to see in the receiver log, not Claude
Code's problem to retry over.

### Unwrapping OTLP by hand

OTLP/JSON wraps every attribute value in a type tag. Without the SDK, you unwrap
it yourself, which is about fifteen lines:

```python
def _attr_value(v: dict):
    """Unwrap an OTLP AnyValue ({"stringValue": ...} / {"intValue": ...} / ...)."""
    for key in ("stringValue", "intValue", "doubleValue", "boolValue"):
        if key in v:
            val = v[key]
            return int(val) if key == "intValue" else val
    return None


def _flatten_attrs(attr_list) -> dict:
    out = {}
    for a in attr_list or []:
        if "key" in a and isinstance(a.get("value"), dict):
            out[a["key"]] = _attr_value(a["value"])
    return out
```

Resource attributes are merged under record attributes (`{**resource_attrs,
**attrs}`), so session identity from the resource block survives onto every
record without being restated per event.

This is the honest cost of the zero-dependency rule: a schema change on
Anthropic's side lands as a silent miss rather than a version bump. The receiver
guards against that by only acting on records that actually carry token counts,
and ignoring everything else:

```python
if "input_tokens" not in attrs and "output_tokens" not in attrs:
    return False
```

Metrics posts land on the same endpoint and fall straight through.

---

## Getting cache accounting right

This is the part naive trackers get wrong. With prompt caching, a "30,000 token"
request may be almost entirely a cache read, billed at roughly a tenth of the
fresh input rate. Claude Code reports the three buckets separately, and the
receiver keeps them separate:

```python
cache_read = _to_int(attrs.get("cache_read_tokens"))
cache_creation = _to_int(attrs.get("cache_creation_tokens"))
input_tokens = _to_int(attrs.get("input_tokens")) + cache_read + cache_creation
output_tokens = _to_int(attrs.get("output_tokens"))
```

Two things worth noting. First, `input_tokens` in the record is the **true total
context**, fresh plus cached, because "how big was this prompt" is a different
question from "what did it cost." Second, the per-bucket counts are preserved on
the record itself, so cost can always be recomputed later without re-ingesting.

A representative line from the log:

```json
{"model": "claude-sonnet-4-6", "input_tokens": 30002, "output_tokens": 0,
 "cache_read_input_tokens": 29562, "cache_creation_input_tokens": 438,
 "total_tokens": 30002, "cost_usd": 0.0126426, "source": "claude_code",
 "session_id": "...", "timestamp": "2026-06-12T22:58:06.517000+00:00",
 "label": "claude_code"}
```

30,002 tokens of context, of which 29,562 were cache reads. Priced as fresh
input that request looks like roughly nine cents; the actual cost was 1.3 cents.
Multiply that error across a working day and a naive tracker is not just
imprecise, it is wrong by a factor that changes decisions.

`cost_usd` is taken from Claude Code's own telemetry rather than recomputed from
a local price table. That is a deliberate call: a hardcoded pricing dict goes
stale the moment a model is repriced or a new one ships, and a tracker that
silently reports stale prices is worse than one that reports none. The cost the
vendor states is the cost that gets stored.

### One call, two rows

Each API call is written as two records: an input row and an output row.

```python
_append_log({**base, "label": f"Prompt: {prompt_text}",
             "input_tokens": input_tokens, "output_tokens": 0,
             "total_tokens": input_tokens})
_append_log({**base, "label": f"Thinking: {prompt_text}",
             "input_tokens": 0, "output_tokens": output_tokens,
             "total_tokens": output_tokens})
```

This makes the timeline read as a conversation, where a prompt and the response
it produced are separately visible, and it keeps the aggregation code free of
branching. The trade is that `total_calls` on the dashboard counts rows, not API
calls, so it reads roughly double. Knowing that, I would probably keep one row
per call and let the dashboard split it for display.

### Labels, and where they come from

With `OTEL_LOG_USER_PROMPTS=1`, Claude Code emits a separate `user_prompt` event
carrying the prompt text. Token events do not include it. So the receiver keeps
the last prompt seen per session, and stamps it onto the next token event:

```python
_last_prompt: dict[str, str] = {}

if "prompt" in attrs:
    text = str(attrs.get("prompt", "")).replace("\n", " ").strip()
    if session_id:
        _last_prompt[session_id] = text
    return False
```

That turns an anonymous wall of token counts into something you can actually
reason about: you can see which prompt cost 40k tokens. The state is
per-process and in-memory, so a receiver restart mid-session loses labels until
the next prompt, which is an acceptable failure for a local tool.

---

## Getting exact numbers out of Antigravity

Gemini via Antigravity has no OTLP export. The naive approach is to estimate
tokens from character counts, which is guesswork dressed as data.

Antigravity runs a local `language_server` process that already knows the real
per-call usage. `ingest_antigravity_rpc.py` talks to it directly, reimplementing
what the IDE extension does, with no extension installed. Discovery is the
interesting part, because the port and CSRF token are per-process and unknown at
startup:

```python
def discover_connections() -> list[tuple[int, str]]:
    """Find (port, csrf_token) pairs for running language_server processes."""
    out = subprocess.run(["ps", "aux"], capture_output=True, text=True).stdout
    connections = []

    for line in out.splitlines():
        if "language_server" not in line:
            continue
        pid = line.split()[1]
        token_m = re.search(r"--csrf_token[=\s]+([a-f0-9-]+)", line)
        if not token_m:
            continue
        csrf = token_m.group(1)

        lsof = subprocess.run(
            ["lsof", "-Pan", "-p", pid, "-iTCP", "-sTCP:LISTEN"],
            capture_output=True, text=True,
        ).stdout
        for lline in lsof.splitlines()[1:]:
            pm = re.search(r":(\d+) \(LISTEN\)", lline)
            if pm and _rpc(int(pm.group(1)), csrf, "Heartbeat", {}, timeout=2) is not None:
                connections.append((int(pm.group(1)), csrf))

    return connections
```

`ps` for the token, `lsof` for the listening port, then a `Heartbeat` RPC to
confirm the pairing before trusting it. Each cascade directory under
`~/.gemini/antigravity-{ide,cli}/brain` is then queried with
`GetCascadeTrajectoryGeneratorMetadata`, which returns real backend usage per
model call: exactly what was billed, not an estimate.

Because this is a 30-second poll rather than a push, it needs idempotency. Every
usage entry carries a `responseId`, and seen IDs persist to
`.antigravity_rpc_seen.json`:

```python
response_id = usage.get("responseId")
if not response_id or response_id in seen:
    continue
```

The dedupe set survives restarts, so the daemon can be stopped and started
without double-counting. It also grows forever, which is the kind of thing that
is fine for a year of local use and would need a bound in anything long-lived.

Prompt labels come from the session transcript: the ingest walks backwards from
the step index of each model call to the most recent `USER_EXPLICIT` step and
pulls the text out of its `<USER_REQUEST>` block.

---

## The generic adapter

For anything else, `token_logger.py` offers `log_usage(response, label=...)`,
which duck-types across three SDK shapes rather than requiring you to normalize
first. Anthropic exposes `usage.input_tokens`; OpenAI exposes
`usage.prompt_tokens`; Gemini exposes `usage_metadata.prompt_token_count`, and in
some paths `usageMetadata.promptTokenCount`. All four shapes appear both as SDK
objects and as raw dicts.

```python
if hasattr(response, "usage"):
    usage = getattr(response, "usage")
    if usage:
        if hasattr(usage, "input_tokens"):        # Anthropic
            input_tokens = getattr(usage, "input_tokens", 0) or 0
            output_tokens = getattr(usage, "output_tokens", 0) or 0
        elif hasattr(usage, "prompt_tokens"):     # OpenAI
            input_tokens = getattr(usage, "prompt_tokens", 0) or 0
            output_tokens = getattr(usage, "completion_tokens", 0) or 0
elif hasattr(response, "usage_metadata"):         # Gemini (snake_case)
    ...
elif hasattr(response, "usageMetadata"):          # Gemini (camelCase)
    ...
```

Attribute sniffing is not elegant. The alternative, a registry of per-provider
adapters, is more elegant and would have to be updated on every new provider
before it worked at all. Sniffing degrades to `("unknown", 0, 0)` instead of
raising, which for an observability tool wrapped around someone's real API call
is the correct failure: never let the meter break the thing it measures.

```python
try:
    model, input_tokens, output_tokens = extract_usage(response)
except Exception as e:
    print(f"[tokens] Warning: failed to parse response usage dynamically: {e}")
    model, input_tokens, output_tokens = "unknown", 0, 0
```

There is also `TokenTracker`, which accumulates records across a multi-step
script and prints a session summary, and a `POST /api/log` endpoint on the
dashboard for anything that would rather send JSON than import a module.

---

## Aggregation and the dashboard

`dashboard_server.py` re-reads the whole log on every `/api/stats` request,
sorts by timestamp, and builds per-model totals, sessions, a timeline, and the
50 most recent calls. The dashboard polls it every 5 seconds.

Re-reading the file each time is O(n) per request and will not hold up at
millions of records. At the scale this operates on, one developer's usage
history, it is instant, needs no schema, no migration, and no index, and the log
stays greppable with `tail` and `jq`. Postgres would be the wrong answer to a
problem I do not have.

**Sessions are inferred, not tracked.** No component emits a session boundary, so
the aggregator derives one from a quiet gap:

```python
gap = (t_curr - t_prev).total_seconds()
if gap > 600:  # 10-minute gap = new session
    sessions.append(_summarize_session(session_records))
    session_records = [curr]
```

Ten minutes is a heuristic, and it is wrong in both directions occasionally: a
long build splits one session in two, and two projects worked back to back merge
into one. It is also the only thing that turns a flat event stream into
"this afternoon's work cost me X" without any component having to agree on what a
session is.

The timeline buckets tokens per hour and drops anything older than 48 hours,
which keeps the payload small and matches what the chart can usefully render.
Records from a removed heuristic-estimation experiment are filtered at read time
by label pattern, so old junk data never has to be deleted to stop skewing
totals:

```python
_JUNK_LABEL_RE = re.compile(r"^ide_step_\d+$")
```

The frontend is a single HTML file with vanilla JS. No build step, no framework,
no bundler, which means it still works untouched in a year.

---

## Process control

All three long-running components take `--start` and `--stop`, writing a PID file
and checking liveness with the standard `os.kill(pid, 0)` trick:

```python
def get_running_pid():
    if PID_FILE.exists():
        try:
            pid = int(PID_FILE.read_text().strip())
            os.kill(pid, 0)   # signal 0: existence check, no signal sent
            return pid
        except (ValueError, OSError):
            pass
    return None
```

Background start uses `preexec_fn=os.setpgrp` so the child gets its own process
group and survives the parent terminal closing. This is not systemd, and a
crashed process stays crashed until noticed. For a local tool the honest answer
is that supervision is not worth its complexity here.

---

## What I would change

- **One row per call.** The two-row split makes the timeline read well and makes
  call counts read wrong. Splitting at render time gets both.
- **Bound the dedupe set.** `.antigravity_rpc_seen.json` grows without limit.
  A dated prune would cost ten lines.
- **Cost in the aggregation.** `cost_usd` is captured per record but the stats
  endpoint aggregates tokens only. Summing it per model and per session is the
  obvious next increment.
- **Rotate the log.** Append-only with no rotation is fine now and will not be
  forever.

---

## Takeaways

Good observability does not require a heavyweight stack. A push receiver instead
of a polling loop, a cost model that respects prompt caching, an append-only log
as the only integration contract, and a parser that degrades instead of raising:
that combination produces real, trustworthy visibility into LLM spend, running
entirely on your own machine, in about 1,200 lines with nothing installed.

The interesting engineering was never the HTTP. It was deciding what to do when
the data is ambiguous: always return 200, never invent a price, prefer a real RPC
number over a plausible estimate, and let the meter fail quietly rather than take
the workload down with it.

Code on [GitHub](https://github.com/boazleleina/token-tracker).

**Stack:** Python 3.10+ · stdlib HTTP servers · OTLP/JSON · local RPC · vanilla JS dashboard · zero dependencies.
