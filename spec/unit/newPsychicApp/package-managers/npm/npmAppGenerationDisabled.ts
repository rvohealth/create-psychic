// TEMPORARY: the npm app-generation specs in this directory are disabled.
//
// They run `npm install` against the boilerplate's pinned `@rvoh/*` floors, which
// we deliberately keep at their LATEST published versions (e.g. the
// psychic-spec-helpers flakiness fix). npm's release-age cooldown
// (`min-release-age`) has NO per-package exclude — it's an open RFC
// (https://github.com/npm/rfcs/issues/895) — unlike pnpm/yarn, which exempt
// `@rvoh/*`. So on npm the cooldown applies to `@rvoh/*` too, and a floor pinned to
// a <3-day-old `@rvoh` version makes `npm install` fail with ETARGET
// ("No matching version found ... with a date before <today − cooldown>").
//
// We will NOT weaken the cooldown (it is the core Shai-Hulud-class supply-chain
// protection) nor pin `@rvoh/*` below latest, so these specs cannot pass while a
// freshly-bumped `@rvoh` version is still inside the cooldown window. pnpm, yarn,
// and bun coverage is unaffected (pnpm/yarn exclude `@rvoh/*`; bun has no cooldown),
// and the unpinned `init`-flow npm specs still run (npm falls back to a mature
// version when no exact version is pinned).
//
// Re-enable (flip to `false`) once npm ships a cooldown exclude (npm/rfcs#895).
export const NPM_APP_GENERATION_SPECS_DISABLED = true
