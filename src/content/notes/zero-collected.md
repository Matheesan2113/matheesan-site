---
title: '0 collected ≠ 0 failed'
description: 'A green CI run is a claim, not evidence. The most dangerous test in your suite is the one that never ran.'
date: 2026-10-28
tags: ['testing', 'ci', 'ai-agents']
reading: '6 min'
---

A launch-critical authentication flow had **116 tests**. CI was green for weeks. Then, during a build-readiness audit, someone asked a question nobody had asked: *how many of those tests actually ran?*

Zero.

The suite was collected, reported as successful, and never executed a single assertion. A handful of schema errors meant the runner skipped every test — and exited 0. The green check was technically true and completely meaningless.

## Green is a claim, not evidence

Most CI systems answer “did the command exit successfully?” They do not answer “did the tests execute?” Those are different questions, and the gap between them is where silent green lives.

A test suite that never runs looks exactly like a test suite that passes:

- the command exits 0,
- the pipeline goes green,
- the pull request merges,
- the defect ships.

The failure mode is **absence**, and absence is quiet.

## Six ways a suite can lie

1. **Collection errors.** A bad import, schema mismatch, or missing fixture means zero tests are collected. Many runners treat that as success.
2. **Path filters.** A change lands in a file the test job does not watch, so the suite is skipped — but the required check still reports.
3. **`allow_failure`.** A known-flaky job is allowed to fail. Eventually it is always failing and nobody notices.
4. **Generated tests.** An AI coding agent adds tests that are syntactically valid but never discovered by the runner.
5. **Selective runs.** “Run affected tests” selects nothing because the dependency graph is wrong.
6. **Timeouts.** The job is killed after the reporter prints a summary, or a linter prints “No issues found” when every rule timed out.

Each one produces the same artifact: a green check with no evidence behind it.

## Make absence loud

The fix is not “write more tests.” It is to make the absence of execution a failure.

### 1. Assert the count

```bash
# Jest
npx jest --json --outputFile=results.json
node -e "const r=require('./results.json'); if(r.numTotalTests===0) process.exit(1)"

# pytest
pytest --json-report
python -c "import json,sys; r=json.load(open('.report.json')); sys.exit(0 if r['summary']['total'] else 1)"
```

The exact command matters less than the rule: **zero collected is a failure**.

### 2. Assert the expected names

A count can be satisfied by the wrong tests. For a launch-critical flow, keep a small allowlist of test names that must appear in the report. If `auth.rejects_expired_token` disappears, the job fails even if 114 other tests passed.

### 3. Tie tests to requirements

Coverage measures lines executed, not behaviour promised. A numbered requirement — “a rejected selection must not be confirmed” — can be traced to one or more tests, and the trace can be checked in CI. When the requirement changes, the test changes. When the test disappears, the trace fails.

### 4. Treat “expected failure” as debt with an owner

`allow_failure`, `xfail`, and skipped tests are not passes. Give each one an owner and an expiry. If it cannot be fixed, delete it and record why — do not leave it in the suite pretending to be coverage.

### 5. Print the evidence

On every run, print:

```text
collected: 116
executed:  116
passed:    115
failed:      1
skipped:     0
```

If that block is missing from the log, the run is not trustworthy.

## The checklist I use now

- Does the CI job fail when zero tests are collected?
- Does it fail when a required test name is missing?
- Are skipped and expected-failure tests owned and expiring?
- Does the log show collected / executed / passed / failed counts?
- Is there a test that asserts the *absence* of the bad behaviour, not just the presence of a good one?
- After an AI-authored change, did the test count go **up**, or did the assertions get weaker?

That last one matters more every year. An AI coding agent can make a suite pass by deleting the assertion that was inconvenient. The diff looks plausible. The suite is green. The bug ships.

**0 collected is not 0 failed.** A suite that never ran is not coverage. It is a receipt for a job that started.
