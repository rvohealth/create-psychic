# PR review — generated CI sync cleanliness check

2 findings — 0 critical, 2 informational, from 4 successful fresh-context reviewers. Native `codex review` could not initialize inside the host sandbox and did not count toward coverage. Review coverage was single-model.

## Finding 1 — fail-open `git status` command substitution

- Status: fixed
- Commit: `9c1a097`
- Severity: informational
- Confidence: 8/10
- Lens: security & trust boundaries
- Location: `src/file-builders/CiWorkflowBuilder.ts:324`
- Summary: The final cleanliness assertion masks a failure from `git status`; if porcelain status cannot be computed and emits no output, `test -z` succeeds and the gate can fail open.
- Motivating code: `test -z "$(git status --porcelain)"`
- Proposed fix: Capture porcelain status in a separate shell command whose exit status must succeed, then assert that the captured value is empty. Add behavioral coverage for a failing `git status` command.

## Finding 2 — cleanliness semantics are not executed by the spec

- Status: fixed
- Commit: `9c1a097`
- Severity: informational
- Confidence: 9/10
- Lens: testing & coverage
- Location: `spec/unit/file-builders/CiWorkflowBuilder.spec.ts:116`
- Summary: The regression spec asserts emitted command strings but never executes the gate, so it does not prove clean/tracked/untracked exit behavior and would miss shell changes that neutralize failures.
- Motivating code: `expect(checksJob).toContain('git status --short')`, `expect(checksJob).toContain('git diff --exit-code')`, and `expect(checksJob).toContain('test -z "$(git status --porcelain)"')`
- Proposed fix: Execute the generated cleanliness shell block in temporary initialized Git repositories and assert success for a clean tree plus failure for tracked changes, untracked files, and a failing `git status` command. Retain builder-shape/order assertions.

## Red team

- No findings after verifying both fixes against the full post-fix diff.
- Recommendation: ship.

## PR follow-ups

- None.

## Verification

- Baseline from `/pln`: `pnpm lint`, `pnpm build`, and the focused 32-test builder spec passed before review.
- PASS — `pnpm lint`
- PASS — `pnpm build`
- PASS — `DEBUG=1 pnpm spec spec/unit/file-builders/CiWorkflowBuilder.spec.ts` (36/36 tests)
