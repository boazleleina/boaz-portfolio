---
title: Designing Resilient Third-Party API Ingestion Pipelines
description: Tackling rate limiting, pagination, and JSON serialization in Python when consuming external REST services.
date: May 10, 2026
category: Systems
---

Consuming third-party APIs (such as Yelp, Google Maps, or meteorological endpoints) is a staple of data engineering. However, public APIs impose strict constraints on rate limits and response formatting.

A production-grade ingestion client must build defensive wrappers around network calls to guarantee complete and consistent data capture.

### 1. Robust Rate Limiting with Exponential Backoff

When api keys are throttled, they return HTTP 429 (Too Many Requests). A robust client shouldn't crash; instead, it should pause execution and retry after an exponentially increasing delay (e.g. 1s, 2s, 4s, 8s).

### 2. Stream Ingestion and Serialization

For large datasets, loading everything into memory is memory-intensive. Ingestion pipelines should write chunks immediately to disk or database tables, serializing incoming JSON payloads and handling missing fields gracefully to ensure clean pipelines.

```python
# Python wrapper handling pagination and rate limiting with backoff
import time
import requests

def fetch_paginated_api(url, params, max_retries=5):
    all_results = []
    backoff = 1.0

    while url:
        response = requests.get(url, params=params)

        # Handle Rate Limiting (HTTP 429)
        if response.status_code == 429:
            time.sleep(backoff)
            backoff *= 2  # Exponential backoff
            continue

        response.raise_for_status()
        data = response.json()
        all_results.extend(data.get('results', []))

        # Traverse Next Link
        url = data.get('next_page_url')
        backoff = 1.0  # Reset backoff on success
    return all_results
```
