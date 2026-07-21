# Generated CI sync cleanliness check — 2026-07-21

## Status

- ✅ 1. Add a package-manager/runtime-aware `psy sync` cleanliness gate to generated CI, with regression coverage — done (commit `0b3a1bf`)

Status legend: ⬜ pending · 🟦 in progress · ✅ done · ⏸ deferred · 🚫 dropped

## Pre-flight findings

- Mandated rules: refreshed clean `main`; loaded `psychic-skill` before inspecting generated backend workflow behavior; read `SECURITY.md`; preserve SHA-pinned actions, least-privilege permissions, and frozen-lockfile installs; use BDD regression coverage; run `pnpm format` before committing; use `pnpm spec`, never direct Vitest invocation.
- Persistent TODOs to surface: none found.
- Psychic learning capture: enabled by `RECORD_PSYCHIC_LEARNINGS=1`; implementation agents must record any new Dream/Psychic framework learning not already covered by `psychic-skill`.
- Verification commands: `pnpm lint`, `pnpm build`, `DEBUG=1 pnpm spec spec/unit/file-builders/CiWorkflowBuilder.spec.ts`.

## Open questions

- (none yet)

## Verification

- PASS — `pnpm lint`
- PASS — `pnpm build`
- PASS — `DEBUG=1 pnpm spec spec/unit/file-builders/CiWorkflowBuilder.spec.ts` (32/32 tests)

## Spinoffs

- (none yet)

---

## Item details

### 1. Generated CI sync cleanliness gate

**Status:** done

**Commit:** `0b3a1bf`

**Intent:** Generated applications must prove in pull-request CI that committed Dream/Psychic generated artifacts are current. The generated `.github/workflows/ci.yml` must run `psy sync` through the application's selected package manager/runtime and fail if synchronization leaves the repository dirty.

**Constraints:**

- Preserve the workflow's supply-chain controls from `SECURITY.md`: least-privilege permissions, immutable action SHAs, and frozen-lockfile installs.
- Use the existing runtime-aware command machinery so Node package managers, Bun, and the implemented-but-not-selectable Deno path stay consistent.
- Prepare the checks job's ephemeral test database before synchronization without allowing migration to perform the synchronization implicitly.
- Treat both modifications to tracked generated files and newly-created untracked generated files as evidence that synchronization was not committed.
- Follow BDD: add the regression expectation before changing the builder.

**Acceptance criteria:**

- The generated checks job migrates its own ephemeral database with synchronization skipped, then runs standalone `psy sync`, then immediately verifies that the repository has no resulting changes before continuing to build, lint, and API-contract checks.
- Generated commands are `pnpm psy sync`, `yarn psy sync`, `npm run psy sync`, `bun run psy sync`, and `deno task psy sync` for their respective supported builder inputs.
- The cleanliness gate fails for tracked modifications and untracked files, and gives enough CI output for a developer to see what synchronization changed.
- Focused `CiWorkflowBuilder` specs cover the gate's presence, ordering, cleanliness semantics, and package-manager/runtime-specific command forms.
- Existing workflow hardening and existing `CiWorkflowBuilder` behavior remain intact.

**Decisions:**

- Put the gate in the existing sequential `checks` job before build/lint/API-contract validation; authority: that job already owns fast generated-code and API-contract checks, and checking synchronized output first makes later checks evaluate the committed/current form.
- Run `psy db:migrate --skip-sync` in the checks job before standalone synchronization; authority: each GitHub Actions job has its own fresh Postgres service, and the existing spec jobs establish the repository's package-manager-aware migration command pattern.
- Define “no changes” as a clean Git worktree including untracked files, not only an empty tracked diff; authority: the requested invariant is that `psy sync` results in no changes, while `git diff --exit-code` alone cannot detect newly-generated untracked artifacts.
- Reuse the builder's existing `psy(...)` command formatter for both migration and synchronization; authority: it already encodes the npm `run`/flag separator, Bun `run`, Deno `task`, and pnpm/yarn forms.
- Keep regression coverage in `spec/unit/file-builders/CiWorkflowBuilder.spec.ts`; authority: the generated workflow is a pure builder output and this file already owns the full package-manager/runtime command matrix.

**Discoveries:**

- The checks job already provisions Postgres/Redis as needed but currently never migrates its database.
- Unit and feature-spec jobs deliberately run `db:migrate --skip-sync`, so neither can prove that the checked-in synchronized artifacts are current.
- Reusing the existing `psy(...)` formatter produces the required sync command for pnpm, Yarn, npm, Bun, and Deno without adding another package-manager branch.
- `git diff --exit-code HEAD` gives a detailed tracked-file diff (including staged changes), while a porcelain-status assertion closes the untracked-file gap.

**Dead ends / don't repeat:**

- Do not use only `git diff --exit-code`; it misses untracked files created by synchronization.
- Do not rely on a porcelain status assertion alone; it identifies changed paths but does not show developers the tracked-file diff in CI output.

**Artifacts:**

- `src/file-builders/CiWorkflowBuilder.ts` — checks-job migration, standalone sync, and tracked/untracked cleanliness gate.
- `spec/unit/file-builders/CiWorkflowBuilder.spec.ts` — ordering, cleanliness semantics, and five package-manager/runtime command-form regressions.
- Verification completed: `pnpm format`, `pnpm lint`, and `pnpm build` pass; the focused spec remains assigned to the final gauntlet.

**Open questions:** none.
