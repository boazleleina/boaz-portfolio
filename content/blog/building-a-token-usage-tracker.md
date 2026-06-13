---
title: Building a Local Token Usage Tracker for LLM API Spend
description: A zero-dependency observability tool that captures live telemetry across Claude Code, Gemini/Antigravity, and custom integrations — with accurate, cache-aware cost tracking.
date: June 13, 2026
category: Observability
---

LLM API spend is deceptively opaque. Across a normal week I bounce between Claude Code, Gemini via Antigravity, and a handful of custom scripts — each with its own pricing, its own token accounting, and its own caching rules. By the time a bill lands, there is no easy way to answer the simple question: *where did the tokens go?*

So I built [Token Usage Tracker](https://github.com/boazleleina/token-tracker) — a local observability tool that captures spend in real time, across every source, using nothing but the Python standard library.

### Why local, and why stdlib

The two constraints that shaped the whole design:

1. **Local only.** Prompt contents are sensitive. I did not want to ship telemetry to a third-party SaaS just to learn how many tokens I spent. Everything stays on my machine.
2. **Zero external dependencies.** No `pip install` archaeology a year from now. The receiver and dashboard run on `http.server` and `json` — stdlib only — so it runs anywhere Python does, with zero install friction.

### Real-time telemetry capture

Claude Code emits native OpenTelemetry. Rather than poll a log file, the tracker stands up a lightweight **OTLP/HTTP receiver** that ingests `api_request` events as they happen — every prompt is logged within ~5 seconds, no polling loop required.

```python
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

class OTLPReceiver(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        payload = json.loads(self.rfile.read(length) or "{}")

        # Walk the OTLP envelope down to individual api_request events
        for rs in payload.get("resourceSpans", []):
            for ss in rs.get("scopeSpans", []):
                for span in ss.get("spans", []):
                    if span.get("name") == "api_request":
                        record_usage(extract_tokens(span))

        self.send_response(200)
        self.end_headers()
```

### Multi-source ingestion

Claude Code is only one source. The tracker also pulls:

- **Antigravity** — RPC-based ingestion from its local language server, giving exact Gemini token counts rather than estimates.
- **Anything else** — a generic `log_usage()` adapter that normalizes Anthropic, OpenAI, and Gemini response shapes into one record format, so custom scripts can report spend in a single call.

Everything lands in a **JSON-lines log** — one event per line — which makes the history trivial to grep, tail, or export.

### Getting caching right

This is the part most naive trackers get wrong. Anthropic's prompt caching means a "100k token" request might bill almost nothing if it's a cache read. So the tracker separates `cache_read` and `cache_creation` tokens from fresh input and applies the correct rate to each bucket:

```python
def estimate_cost(usage, pricing):
    fresh_input = usage["input_tokens"]
    cache_write = usage.get("cache_creation_input_tokens", 0)
    cache_read  = usage.get("cache_read_input_tokens", 0)
    output      = usage["output_tokens"]

    return (
        fresh_input * pricing["input"]
        + cache_write * pricing["cache_write"]   # ~1.25x input
        + cache_read  * pricing["cache_read"]    # ~0.1x input
        + output      * pricing["output"]
    )
```

Without that split, cost estimates can be off by an order of magnitude on cache-heavy sessions.

### The dashboard

A second stdlib HTTP server serves a single-page HTML/JS frontend that auto-refreshes:

- per-model token totals
- gap-based **session grouping** (a quiet gap starts a new session)
- an hourly timeline of activity
- running **USD cost** tracking

No build step, no framework — just vanilla JS reading the JSON-lines log.

### Takeaways

The whole thing is a reminder that good observability does not require a heavyweight stack. A standard-library HTTP receiver, a careful cost model that respects caching, and a flat append-only log get you real, trustworthy visibility into LLM spend — running entirely on your own machine.

The code is on [GitHub](https://github.com/boazleleina/token-tracker).

**Stack:** Python 3 · stdlib HTTP servers · OTLP/JSON protocol · vanilla JS dashboard.
