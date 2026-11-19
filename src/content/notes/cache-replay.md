---
title: 'One bad answer, replayed all day'
description: 'Temperature zero is not determinism, and a cache keyed by date can turn one bad model response into a day-long outage.'
date: 2026-10-14
tags: ['llm', 'caching', 'incident-response']
reading: '7 min'
---

For most of a day, every monitor on one cluster failed — 44 of 44. The obvious theory was infrastructure: pods restarting, a bad node, a network partition. The real cause was smaller and stranger. A per-cluster Redis cache was replaying the same bad LLM answer, over and over, until its date-keyed entry rolled over at midnight.

One bad answer. One cache key. A whole day of false confidence.

## The shape of the failure

The system cached LLM responses to save cost and latency. The key included the prompt and a date. The value was whatever the model returned the first time. A response that was wrong — but syntactically valid — got stored like any other.

Because the key rolled over daily, the bad answer survived until the next day. Restarting pods did nothing: the cache lived outside them. Re-running the request did nothing: the request hit the same key. The system looked healthy at every layer except the one that mattered — the answer was wrong, and every monitor faithfully reported the consequence.

## Temperature zero is not a determinism guarantee

“We set temperature to 0” is often treated as “the model is deterministic.” It is not.

- Model versions change. The same prompt can produce different output after a provider upgrade.
- Quantization, hardware, and batching can change numerics.
- System prompts, tool definitions, and context ordering are part of the input.
- Providers may route to different regions or model snapshots.
- A cached answer is a snapshot of *one* sample, not the distribution.

Temperature 0 reduces sampling variance. It does not make the model a pure function forever.

## Cache the input, version the world

A cache key is a promise that two requests are equivalent. For LLM calls, that promise needs more than the prompt text.

Include:

- **model identifier and version** — not just “gpt-class” but the exact deployment;
- **prompt template version** — a hash of the rendered template, not the raw user text alone;
- **decoding parameters** — temperature, top-p, max tokens, stop sequences;
- **tool schema version** — changing a tool definition changes the output;
- **tenant or policy scope** — two tenants may have different system instructions;
- **date bucket** — only if the answer is genuinely time-scoped, and then document why.

Invalidate on deploy. If a prompt, model, or tool schema changes, the old entries are not “warm.” They are stale.

## Make the cache observable

A cache that only reports hit rate is hiding the interesting question: *are the hits correct?*

Add:

- a **sample bypass** that calls the model directly for a small percentage of traffic and compares the answers;
- a **cache age histogram** — an answer from 23 hours ago is a different risk from one from 23 seconds ago;
- a **model-version tag** on every hit, so a provider upgrade shows up as a step change;
- a **kill switch** that bypasses the cache entirely without a deploy;
- an **eval** that runs against cached responses, not just fresh ones.

The last one is the important one. Your evals probably call the model. Production may not. If the cache is in the path, the cache is part of the system under test.

## The postmortem question

The useful question was not “why did the pods restart?” It was “what did we assume was fresh?”

We assumed the answer was new because the request was new. It was not. The request was new; the answer was a day old.

Once we saw that, the fix was straightforward: version the key, invalidate on deploy, add the bypass, and alert on answer drift rather than only on request failure.

## Checklist

- Does every LLM cache key include model, prompt, decoding parameters and tool schema versions?
- Is there a bounded TTL, and does a deploy invalidate the cache?
- Can you bypass the cache without a deploy?
- Do you sample fresh answers and compare them to cached ones?
- Do your evals exercise the cached path?
- When an answer is wrong, can you tell whether it was generated now or replayed?

**A cache turns one sample into policy.** Treat the key like a schema, and treat a stale hit like a production change.
