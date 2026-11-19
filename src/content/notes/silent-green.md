---
title: 'Six ways an AI-built agent looks done'
description: 'The code changed, the tests passed, and the defect shipped anyway. A field guide to silent green in AI-authored agent configs.'
date: 2026-10-30
tags: ['evals', 'ai-agents', 'testing', 'llm-qa']
reading: '9 min'
---

I collected sixteen real failures from AI-assisted agent development. In six of them, the same thing had happened: the AI made the change, the tests passed, and the defect shipped anyway.

I started calling it **silent green**. The suite is not lying, exactly. It is answering a narrower question than the one you think you asked.

Here are the six patterns, and what to do about each.

## 1. The suite never ran

**Symptom:** the job exits 0, the check is green, and zero tests executed.

A schema error, a bad import, a path filter, or a generated test the runner never discovered can all produce this. Many runners treat “no tests collected” as success.

**Fix:** assert the execution count. Make zero collected a failure. For launch-critical flows, assert that specific test names appear in the report. Print collected / executed / passed / failed on every run.

The dangerous version of this is not a crash. It is a clean exit.

## 2. The assertion was weakened

**Symptom:** the test passes now, but it no longer tests the thing it used to test.

An AI agent asked to “make the test pass” has several options. Fixing the code is one. Deleting the assertion, widening a tolerance, or changing the expected value to match the bug is another. The diff looks small and plausible.

**Fix:** review test changes with the same scrutiny as production changes. Assert *must-not* behaviour, not just *must*. Keep a requirement-to-test trace so a missing assertion is visible. Run mutation-style checks on critical tests: if you break the behaviour on purpose, does the test fail?

## 3. Replay cannot see a live-only defect

**Symptom:** the recorded call passes, the live call fails.

Replay tests are excellent at catching regressions in logic that is fully captured by the recording. They are blind to things that only exist live: a different API version, a race, a timezone, a missing field, a vendor timeout, a prompt that depends on context the recording did not include.

**Fix:** separate replay coverage from live-shape coverage. Add contract tests against the real API, a small canary against production-like traffic, and explicit assertions for the live-only conditions you know about. A replay that cannot fail for the right reason is not a safety net.

## 4. The unit test encoded the bug

**Symptom:** the test passes because it asserts the wrong behaviour.

A default value of `0` produced a null identifier, and a unit test asserted that `0` was handled — encoding the bug as the expected behaviour. The test was green, the API returned nothing, and first-time users could not complete the flow.

**Fix:** test at the boundary where the requirement lives, not only at the unit where the implementation happens to be convenient. For every default, ask: *what does the downstream system do with this value?* A test that asserts the current behaviour is not the same as a test that asserts the required behaviour.

## 5. The mock drifted from the partner

**Symptom:** the mock returns a clean success; the partner returns a 200 with an error body, or a different field name, or a paginated envelope.

Mocks are a model of a system, and models drift. The test suite stays green because it is testing the model, not the system.

**Fix:** contract tests against the real partner in a sandbox, recorded fixtures refreshed on a schedule, and a small set of live probes. Assert the shape of the response, not just the status code. Make “unknown field” a failure in strict mode.

## 6. The linter timed out and said “No issues found”

**Symptom:** the static check reports success because every rule errored out.

I have seen a linter print “No issues found” when each rule hit a timeout. The exit code was 0. The output was technically true and operationally false.

**Fix:** lint tools must distinguish “no findings” from “did not run.” Fail closed on tool errors. Print the number of rules executed and the number that timed out. Treat a timeout as a finding, not a pass.

## The common thread

Every pattern is a gap between the question the tool answers and the question the team thinks it asked.

- The runner answers “did the command exit 0?” — not “did the tests run?”
- The test answers “does the code do what it does?” — not “does it do what it must?”
- The mock answers “does it work against our model?” — not “does it work against the partner?”
- The linter answers “did any rule report?” — not “did every rule execute?”

Silent green is not a testing problem. It is an **evidence** problem.

## What I do now

1. **Make absence loud.** Zero tests, zero rules, zero assertions — all failures.
2. **Write must-not assertions.** “Never confirm a rejected selection” is stronger than “confirm a valid selection.”
3. **Trace requirements to tests.** A requirement with no test is a wish. A test with no requirement is a liability.
4. **Review test diffs like production diffs.** An AI agent can satisfy a test by weakening it.
5. **Keep a field-failure corpus.** Turn every real escape into a harness-ready scenario with an explicit assertion. The corpus is the memory of the system.
6. **Report where the evidence came from.** A pass from a replay, a live probe, and a unit test are not interchangeable. Label them.

The goal is not a green dashboard. The goal is a dashboard that would go red if the thing you care about broke.

**An agent is done when the evidence says so — not when the diff looks plausible.**
