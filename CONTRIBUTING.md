# Contributing to create-psychic

`@rvoh/create-psychic` is the generator behind `npx @rvoh/create-psychic new my-app`. It has two commands:

- `new` scaffolds a new Psychic app. It can add React, Next.js, Vue or Nuxt clients.
- `init` adds Psychic or Dream to an existing TypeScript app.

This guide covers getting from a fresh clone to a green pull request.

| Path           | What it holds                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/`         | The CLI. `src/bin.ts` is the published bin. `src/psy.ts` is the local development entry point. `src/helpers/` and `src/file-builders/` assemble each generated app. |
| `boilerplate/` | Files copied into generated apps. `{{PM}}`-style placeholders are replaced with the chosen package manager.                                                         |
| `spec/`        | Vitest specs. Expected-output fixtures live in `spec/fixtures/expected-files/`.                                                                                     |

## Reporting bugs and vulnerabilities

- **Do not open a public issue for a security vulnerability.** Follow [SECURITY.md](SECURITY.md) instead.
- Search the [issues](https://github.com/rvohealth/create-psychic/issues) first. If your bug is not there, [open a new issue](https://github.com/rvohealth/create-psychic/issues/new). Include:
  - the create-psychic version and the exact command you ran;
  - your Node, package manager and Postgres versions;
  - what you expected and what happened.

## Prerequisites

- **Node.js 26** is the primary target. **Node.js 24** is the oldest supported version. CI runs specs and the build on both, and runs lint on Node 26.
- **pnpm 12.14.0.** CI installs it with `pnpm/action-setup` (`version: 12.14.0`). This repo's `package.json` has no `packageManager` field, so nothing pins pnpm for you locally. Check with `pnpm --version`. Either install pnpm 12.14.0 on its own, or use corepack:

  ```sh
  npm i -g corepack          # Node 26 no longer ships corepack
  corepack enable            # installs pnpm and yarn shims
  corepack install -g pnpm@12.14.0
  ```

  Skip the last line and corepack runs its own default pnpm instead, which may be a newer 12.x.

  **Older Node 24:** Node 24 releases before 24.12.0 bundle corepack 0.34.4 or earlier. That corepack cannot launch pnpm 12, so every `pnpm` command fails with `MODULE_NOT_FOUND …/bin/pnpm.cjs`. On those releases, run `npm i -g corepack@0.34.7` first, or use Node 26 or a standalone pnpm.

- **yarn**, for the yarn specs. The generator uses the `yarn` on your `PATH` when `yarn --version` runs, and falls back to `corepack enable yarn` when it does not. On Node 26 you need corepack installed (as above) or a global yarn. Each generated yarn app then runs `yarn set version stable` for itself.
- **Bun** 1.4.0 or later (optional). The Bun runtime specs skip themselves unless `bun` is on your `PATH`. With an older Bun on your `PATH` they fail at the first `#` import with `Cannot find module`, because a generated Bun app needs Bun 1.4.0 (its `engines.bun`). CI installs Bun.
- **Deno: do not put it on your `PATH`** while running the full suite. The Deno specs fail when `deno` is installed. This is expected, because Deno is hidden from the CLI until an upstream bug is fixed. See "Known Failure: Deno runtime specs" in [AGENTS.md](AGENTS.md) and [docs/deno-runtime-readiness.md](docs/deno-runtime-readiness.md).
- **PostgreSQL** on `localhost:5432`, with a database named `howyadoin_test`. CI uses Postgres 18, and uuid7 primary keys need Postgres 18. Specs connect as:
  - your OS username, or `psychic` when `CI` is set;
  - with the password in `DB_PASSWORD`, or an empty password when it is unset.
- **Redis.** CI also runs a Redis 7 service on port 6379. Run one locally to match CI.
- **Network access.** The specs install real packages from the npm registry, and the `init` specs run `npx create-next-app@latest`.

## Setup

```sh
git clone https://github.com/rvohealth/create-psychic.git
cd create-psychic
pnpm install --frozen-lockfile
pnpm puppeteer browsers install firefox   # generated apps' feature specs run in Firefox
createdb howyadoin_test
```

There are no `.env` files to set up for this repo. The generator writes `.env` and `.env.test` into each app it creates, using the same database credentials described above.

## Running the generator locally

`pnpm psy` runs the CLI from source with `tsx`, in the current directory. Name the app `howyadoin`: that name is gitignored, and every spec run deletes it.

The command asks for any option you do not pass. The "generate a github actions workflow file?" question has no flag, so it is always asked. Passing any `--client` flag skips the monorepo question.

```sh
# Node with pnpm, yarn or npm (pick one with --package-manager)
pnpm psy new howyadoin --runtime node --package-manager pnpm \
  --primary-key-type bigint --client none --no-workers --no-websockets \
  --no-claude-psychic-skill --no-agents-psychic-skill

# Bun (Bun is both the runtime and the package manager, so there is no --package-manager)
pnpm psy new howyadoin --runtime bun --primary-key-type bigint --client none \
  --no-workers --no-websockets --no-claude-psychic-skill --no-agents-psychic-skill
```

- Clients: `--client`, `--admin-client` and `--internal-client` each take `react`, `nextjs`, `vue`, `nuxt` or `none`.
- Other flags: `--workers` / `--websockets` and their `--no-` forms. `pnpm psy new --help` and `pnpm psy init --help` list everything.
- To try the published bin instead, run `pnpm build` and then `node /path/to/create-psychic/dist/esm/src/bin.js new my-app` from any directory. The bin defaults to `new` when you leave out the command.
- Generated apps install `@rvoh/*` packages from npm. Your local checkouts of Dream or Psychic are not used.
- The npm path generates apps, but its install can fail with `ETARGET`. This happens while a just-released `@rvoh/*` version is still inside npm's release-age cooldown, because npm has no per-package exclude. See `spec/unit/newPsychicApp/package-managers/npm/npmAppGenerationDisabled.ts`.

## How the specs work

`pnpm spec` runs `vitest` with `spec/unit/vite.config.ts` and `CREATE_PSYCHIC_CORE_TEST=1`. Spec files run one at a time, because they all share the `howyadoin` directory and database. Before each spec, `spec/unit/setup/hooks.ts` does three things:

1. It removes `packageManager` from `package.json`, and restores it after the spec. If you interrupt a run, check `git status`.
2. It deletes `./howyadoin`.
3. It drops and recreates the `public` schema of `howyadoin_test`. This happens only under `NODE_ENV=test`, which vitest sets.

When `NODE_ENV=test`, the generator defaults the runtime to Node and skips the GitHub Actions question.

- **Generation specs** live in `spec/unit/newPsychicApp/` and `spec/unit/initPsychicApp/`.
  - **What they do:** each one generates a real `howyadoin` app (through `spec/helpers/newSpecPsychicApp.ts` or `initSpecPsychicApp.ts`). It installs the app's dependencies, generates a model and migrates the app. Then it runs the app's own scripts: `uspec`, `fspec` and `build`, depending on the spec. The pnpm no-client spec also runs the app's `lint` (ESLint, then `prettier . --check`), so a template file in that app that fails either check fails that spec (the app has no workers, websockets, client or psychic-skill). Before that it formats only the files `g:model User` wrote, since generator output need not be Prettier-clean (the app's `format` script fixes it), and a whole-app `format` would hide a mis-formatted template file. It also runs `pnpm audit --audit-level moderate`, so a new advisory against a boilerplate dependency fails that spec until the boilerplate is updated.
  - **Layout:** they are grouped by package manager (`package-managers/{pnpm,yarn,npm}`), by runtime (`runtimes/{bun,deno}`) and by client type. They are slow, and each sets its own timeout.
  - **Fixtures:** `expectToMatchFixture` compares generated files with `spec/fixtures/expected-files/`. When you change generated output on purpose, update the fixture too, and add any new fixture path to `FIXTURE_PATHS` in `spec/helpers/expectToMatchFixture.ts`.
  - **npm:** the npm app-generation specs are currently skipped (`NPM_APP_GENERATION_SPECS_DISABLED`), for the cooldown reason described above. The npm `init` specs still run.
- **Boilerplate specs** (`spec/unit/boilerplate/`) read files under `boilerplate/` directly and do not generate an app, so they are fast. They pin invariants of the shipped template. For example, `boilerplate/api/package.json` must have no `overrides` or `resolutions` and no package listed in both `dependencies` and `devDependencies`.
- **Unit specs** (`spec/unit/file-builders/`, `spec/unit/helpers/`, `spec/unit/bin/`) cover individual builders and helpers, and are also fast.

```sh
DEBUG=1 pnpm spec                                      # everything (long; CI splits it into 5 shards)
DEBUG=1 pnpm spec spec/unit/boilerplate                # one directory
DEBUG=1 pnpm spec spec/unit/newPsychicApp/package-managers/pnpm/no-client.spec.ts
DEBUG=1 pnpm spec --shard=1/5                          # one CI shard
```

`DEBUG=1` prints the output of every command the generator runs. Without it, a failing install or migration often shows up only as `process exited with code 1`.

**Troubleshooting a failing generation spec:**

1. Add `console.log` markers around the calls in the spec helper chain until you find the failing command.
2. Log the command string.
3. `cd` into `howyadoin` (or `howyadoin/api` for an app with a client) and run that command yourself.
4. Remove the markers when you are done.

"Troubleshooting Spec Failures" in [AGENTS.md](AGENTS.md) has more detail.

## Running checks

| Command       | What it does                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint`   | ESLint on `src/` and `spec/`, then `prettier . --check`                                                                          |
| `pnpm format` | `prettier . --write`                                                                                                             |
| `pnpm build`  | Type-checks and compiles CJS and ESM into `dist/`, then copies `boilerplate/` into both. There is no separate type-check script. |
| `pnpm spec`   | The spec suite described above                                                                                                   |

Prettier checks every file that is not ignored, including untracked files at the repo root.

CI (`.github/workflows/pr-checks.yml`) runs these jobs on every pull request:

- **Linting** runs `pnpm lint` on Node 26.
- **Check build** runs `pnpm build` on Node 26 and 24.
- **Unit tests** runs `DEBUG=1 pnpm spec --shard=N/5` on Node 26 and 24, with Postgres 18, Redis 7, Firefox and Bun available.

## Dependency updates and supply-chain policy

- **Two dependency sets.**
  - The CLI's own: `package.json` and `pnpm-lock.yaml`.
  - The template's: `boilerplate/api/package.json` and `boilerplate/api/pnpm-workspace.yaml`. The template ships no lockfile, so a generated app resolves its versions when it is created.

  Consider both when you update dependencies. The boilerplate must take fixes through its parent packages' ranges, not through `overrides` or `resolutions`; the boilerplate specs enforce this.

- **Release-age cooldown.** It lives in `pnpm-workspace.yaml`, not `.npmrc`: `minimumReleaseAge: 4320` (3 days), and `minimumReleaseAgeExclude` lists only `@rvoh/*`. pnpm 11+ ignores release-age keys in `.npmrc`, which holds only registry settings.
- **How the cooldown is enforced.** pnpm enforces `minimumReleaseAge` from `pnpm-workspace.yaml` on every install. It resolves no version younger than the cooldown, and it checks every `pnpm-lock.yaml` entry against it, so CI's `pnpm install --frozen-lockfile` fails on an entry younger than 3 days. The `@rvoh/*` exclusion is the only standing bypass. Changes to `pnpm-workspace.yaml`, `.npmrc`, any pnpmfile, or the workflow files are reviewed like any other code change.

  For an urgent third-party patch, add a one-off exclude for that exact version (`'<package>@<version>'`) and remove it once that version is 3 days old. Removing it sooner fails every install, CI's included. Never leave a permanent third-party exclude.

- **Build scripts.** `allowBuilds` in `pnpm-workspace.yaml` is a supply-chain allowlist; only `esbuild` and `puppeteer` are on it. Keep it minimal.
- **Node support.** If you change it, also update `CI_NODE_VERSIONS` in `src/file-builders/CiWorkflowBuilder.ts`, which sets the Node versions in generated apps' CI. See "Node.js Support" in [AGENTS.md](AGENTS.md).

See [SECURITY.md](SECURITY.md) for the full hardening notes.

## Changes and pull requests

1. Branch from an up-to-date `main`. Pull requests are merged through the GitHub UI.
2. Before you open or update a PR, run `pnpm format`, `pnpm lint` (zero errors), `pnpm build` and the specs that cover your change.
3. Describe both the problem and the fix in the PR, and link the issue if there is one.
4. Add a `CHANGELOG.md` entry under the next version heading. Write it for people who generate apps: say what changes in the CLI or in the apps it produces.
5. Export an error only when a Psychic app developer needs to throw or catch it. See "Public Error Exports" in [AGENTS.md](AGENTS.md).

Code owners are listed in [CODEOWNERS](CODEOWNERS). [RELEASING.md](RELEASING.md) explains how to cut a release: bump `package.json`, then publish a GitHub release whose tag matches. That runs `.github/workflows/release.yml`, which publishes to npm.

Thanks for contributing!
