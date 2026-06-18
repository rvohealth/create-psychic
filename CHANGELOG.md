## 3.5.3

- Bump the generated app's `@rvoh/dream` to `^2.14.0` and `@rvoh/dream-spec-helpers` to `^2.2.0`, which carry the per-live-worker test-database pool that fixes the intermittent unit-spec flakiness (a record created in a test's `beforeEach` vanishing before the request under test ran, surfacing as random 404s / empty lists). The fix is entirely internal to those two packages — each test worker now claims its own database from a pre-created pool via a Postgres advisory lock instead of keying off vitest's reusable `VITEST_POOL_ID` slot — so no boilerplate change is needed: the generated `spec/unit/vite.config.ts` keeps vitest's default `isolate: true`, the `db:reset` script already creates and drops the `<base>_<n>` range (now just wider), and `hooks.ts`' `beforeEach(truncate)` is unchanged because `truncate` resolves the claimed database internally.

## 3.5.2

- Pre-declare the pnpm `allowBuilds` map (`esbuild: false`, `msgpackr-extract: false`, `puppeteer: false`) in the generated `api/pnpm-workspace.yaml`. pnpm 11 rewrites `pnpm-workspace.yaml` on every non-interactive install, appending any build-script dependency it hasn't been told about as the invalid placeholder `<pkg>: set this to true or false` ([pnpm/pnpm#11574](https://github.com/pnpm/pnpm/issues/11574)) — so a freshly-generated app's checked-in workspace file was getting mutated the first time the user ran `pnpm install`. Listing the three build-script deps the boilerplate ships keeps the file untouched on install. All three are pinned to `false` (blocked), so the security posture is unchanged: none of them needs its build script to run (esbuild/msgpackr-extract ship prebuilt binaries; puppeteer's browser is installed by an explicit step). Applies to both the `new` (boilerplate) and `init` (dependency installer) flows; `SECURITY.md` is updated to match. A new transitive build-script dep will still surface as a placeholder on first install — set it to `false` (or `true` only if it genuinely must build).

## 3.5.1

- Fix `create-psychic new <name>` (and `init <name>`) failing with `error: too many arguments for 'new'. Expected 1 argument but got 2`. The bin unconditionally injected the `new` subcommand even when the user had already typed it, so commander received the subcommand as a second positional argument. The bin now injects a default subcommand only when none was provided. The argv-massaging logic is extracted to `resolveCliArgv` and unit-tested — previously specs called `newPsychicApp()` directly and never exercised the bin's argv parsing, which is how this regression shipped.
- Remove the duplicate `openapi-typescript` entry from the boilerplate `api/package.json` (it was declared in both `dependencies` at `^7.13.0` and `devDependencies` at `^7.8.0`). npm/pnpm/yarn silently dedupe to the `dependencies` copy, but `bun install` warns on it, so it only surfaced once bun-runtime generation landed in 3.5.0. Generated apps keep the `^7.13.0` `dependencies` entry, so no resolved version changes. Added a unit spec asserting no boilerplate dependency appears in both sections.
- Migrate generated apps off the legacy `koa-bodyparser` to the officially-maintained `@koa/bodyparser` (`^6.1.0`), matching the framework change in `@rvoh/psychic` 3.6.0 (the boilerplate `@rvoh/psychic` floor is raised to `^3.6.0` accordingly). `@koa/bodyparser` ships its own types, so `@types/koa-bodyparser` is dropped. The boilerplate's `psy.set('json', { jsonLimit: '20kb' })` is unchanged — `jsonLimit` carries over identically. Applies to both `new` (boilerplate) and `init` (dependency installer) flows.
- Remove the dead `@types/koa-etag` dependency from the boilerplate and the `init` installer. The generated app (and psychic) imports `@koa/etag`, which ships its own types; `koa-etag` is never imported, so its `@types` package was unused.
- Bump the boilerplate `api/package.json` dependency floors to current (cooldown-cleared) versions. Notably `bullmq` (`^5.49.1` → `^5.78.0`) and `ioredis` (`^5.4.1` → `^5.11.1`) were below the `@rvoh/psychic-workers` peer-dependency floors (`^5.64.0` / `^5.8.2`); the rest are same-major safe bumps (`@koa/router`, `pg`, `socket.io-adapter`, `winston`, `dotenv`, `@types/pg`, `@types/koa__cors`, `@types/supertest` aligned to supertest 7, `@typescript-eslint/*`, `prettier`, `tsx`, `tsc-alias`, `nodemon`, `vite`, `vitest`, `supertest`). Each target version is past the 3-day install-time cooldown so generation isn't blocked. `commander` is held at `^14` (every framework peer dep caps it there; 15.x exists but is out of range), and `koa-bodyparser` stays at `^4.4.1` (the framework imports it directly; the modern `@koa/bodyparser` is a different, API-incompatible package).

## 3.5.0

- **Node/Deno/Bun runtime support.** New `runtime` prompt (and `--runtime` flag) that, for `deno`/`bun`, subsumes the package-manager prompt — each is its own toolchain. Per-runtime generation: `bun install`/`deno install`, lockfiles, run/tsc commands, `deno.json` (import map + sloppy-imports + nodeModulesDir) / `bunfig.toml` config (emitted instead of `.nvmrc`), rewritten package.json scripts (so app code runs on the chosen runtime, not the Node `.bin` shims), and runtime-aware hardened GitHub Actions CI (SHA-pinned `setup-bun`/`setup-deno`). Requires `@rvoh/dream` ≥ 2.12.0 and `@rvoh/psychic` ≥ 3.5.0 in generated apps. Node + pnpm remain the defaults.
- Prompt options now show each runtime's / package manager's install-time supply-chain posture (lifecycle-script blocking + release-age cooldown). Deno/Bun are NOT positioned as more secure than pnpm: runtime permission flags are process-wide (they can't isolate dependency code from app code), so egress hardening belongs at the infrastructure layer (see the generated `SECURITY.md`), not the runtime.
- Boilerplate: `node:os` import prefix in `workers.ts` (Deno rejects bare builtin specifiers); `dotenv` bumped to `^17.2.3` to align with the `@rvoh` packages so Deno resolves a single `@rvoh/dream` copy.
- Generation now runs package binaries / scaffolders with the selected package manager instead of always falling back to `npx`. The puppeteer-browser install uses `pnpm`/`yarn`/`bunx`/`deno` as appropriate (DRY'd behind a shared `execCmdForPackageManager` helper, replacing the two duplicated switch/ternary copies in `CiWorkflowBuilder` and `installApiDependencies`); `create-next-app` now uses `pnpm create next-app` / `yarn create next-app` (matching the existing `create vite` handling); and the `nuxi` (Nuxt) scaffolder uses `pnpm dlx` / `yarn dlx` via a shared `dlxCmdForPackageManager` helper. Previously all three used `npx` for pnpm/yarn apps. `npm` and `bun`/`deno` behavior is unchanged.
- Boilerplate `api/src/conf/initializers/websockets.ts` now selects the websockets transport adapter per environment: `test` uses the in-process adapter (no Redis — hermetic unit specs, with real in-process delivery to feature specs for broadcasts emitted within the websocket-server process; cross-process fan-out still needs Redis, as in production), while `development`/`production` keep the Redis adapter. The Redis connection is now configured only outside of `test` (gated behind `!AppEnv.isTest`), so generated apps no longer open a Redis socket during `test`. Requires `@rvoh/psychic-websockets` ≥ 3.2.0 (the release that introduces the adapter seam); the boilerplate dependency floor is raised accordingly.
- Boilerplate `api/src/conf/initializers/websockets.ts` now documents the two configurable connection limits (commented, since both keep their prior defaults): `maxConnectionsPerUser` caps how many sockets a single user may register at once (registering past the cap evicts that user's oldest socket — a per-user resource bound), and `maxConnectionTtl` sets the garbage-collection TTL on the socket-id registry key (a backstop for ungraceful disconnects, not the live socket's lifetime). Requires `@rvoh/psychic-websockets` ≥ 3.3.0; the boilerplate dependency floor is raised accordingly.
- Bun-targeted generated apps now set `trustedDependencies: []` so **no** dependency runs install/postinstall scripts. Bun's "default-deny" is not actually deny-all — it ships a built-in allowlist of popular packages (puppeteer included), so without this it would run puppeteer's Chrome-download postinstall. The empty list matches the block-all posture of pnpm (`strictDepBuilds`) / npm (`ignore-scripts`) / yarn; the browser is still installed explicitly via `bunx puppeteer browsers install firefox`. CI (`pr-checks.yml`) installs Bun (`oven-sh/setup-bun`) so the bun-runtime generation specs run.
- The boilerplate's `@rvoh/*` dependency floors track their latest published versions, so generated apps require the newest Dream/Psychic (e.g. the `psychic-spec-helpers` flakiness fix). Caveat: npm has no per-package release-age cooldown exclude ([npm/rfcs#895](https://github.com/npm/rfcs/issues/895)), unlike pnpm/yarn, so a freshly-published `@rvoh` floor can't be `npm install`ed until it clears the 3-day cooldown. Rather than weaken the cooldown (its Shai-Hulud-class protection) or pin `@rvoh` below latest, create-psychic's own npm app-generation specs are temporarily skipped (`npmAppGenerationDisabled.ts`); pnpm/yarn/bun coverage is unaffected.

## 3.4.4

- Boilerplate `api/src/conf/initializers/websockets.ts` no longer gates `PsychicAppWebsockets.init()` behind a service-role check. Any process — websocket server, web server, or worker — may call `Ws.emit()`, and skipping init in any of them causes a hard-to-diagnose `cachePsychicAppWebsockets` runtime error. The initializer now runs in all processes by default. A commented-out role-list guard (`['websockets', 'web', 'worker']`) is included for apps that want to restrict which roles can push messages.

## 3.4.3

- Generated pnpm apps now set `strictDepBuilds: false` in `pnpm-workspace.yaml`. Dependency build scripts remain blocked by default, but newly introduced optional native package build scripts no longer make app creation fail.
- Added pnpm scaffold regression coverage for the generated `pnpm-workspace.yaml` build approval policy.

## 3.4.2

- Boilerplate `api/spec/features/setup/hooks.ts` now calls `resetBrowserState()` (from `@rvoh/psychic-spec-helpers` ≥ 3.1.0) in `afterEach`. The feature-spec browser is shared across spec files, so without per-spec cleanup `localStorage`/cookies leak between specs (incomplete isolation) and an in-flight request can keep a pooled DB client checked out across `server.stop()`. `resetBrowserState()` clears storage + cookies and navigates to `about:blank`, fixing both. The connection-lifecycle robustness itself is handled upstream in `@rvoh/dream` (bounded pool drain); this keeps per-spec teardown fast, clean, and properly isolated.
- Boilerplate `api/src/conf/dream.ts` now sets sensible pg connection defaults on the primary/replica credentials via the `pg:` key added in `@rvoh/dream` 2.11.2: `connectionTimeoutMillis` (default `5000`, override via `DB_CONNECTION_TIMEOUT_MS`) so an exhausted pool / DB stall fails fast instead of hanging forever (pg default is `0` = wait forever); `application_name` (from `APP_NAME`) so connections aren't anonymous in `pg_stat_activity` / server logs during incident response; and `keepAlive: true` so dead connections behind a load balancer / NAT are detected. `statement_timeout` / `query_timeout` / `idle_in_transaction_session_timeout` are intentionally left unset with an inline comment pointing to the Postgres-role approach (a blanket app-wide value would kill long migrations/reports). Generated apps get these defaults; the `@rvoh/dream` library itself stays backward compatible (nothing defaulted there). The boilerplate `AppEnv` allowlist gains `DB_CONNECTION_TIMEOUT_MS` (integer) and `APP_NAME` (string) so generated apps typecheck, and the boilerplate dependency floors are raised to `@rvoh/dream ^2.11.2` and `@rvoh/psychic-spec-helpers ^3.1.0` (the versions that ship the `pg:` passthrough and `resetBrowserState`) so a resolved older version can't silently drop these.

## 3.4.1

Refines the R-027 Postgres TLS migration shipped in 3.4.0. Pairs with dream@2.10.0, which narrows `DreamDbConfig.ssl` to `TlsConnectionOptions | false` and throws when the directive is omitted.

- Boilerplate `api/src/conf/dream.ts` now defaults `ssl: { rejectUnauthorized: true }` — verified TLS via Node's system CA store. Works out of the box with managed providers that present a public-CA-signed certificate (Supabase, Neon, Render, Azure Database for PostgreSQL Flexible Server).
- `DB_NO_SSL=true` escape hatch resolves to `ssl: false` (the new explicit TLS-off sentinel) rather than the previous boolean form.
- Inline comment names the managed-provider matrix so scaffolded apps know which override to pick: AWS RDS and GCP Cloud SQL need a private-CA `ca` bundle; Heroku Hobby and some local Docker images need `rejectUnauthorized: false`.

## 3.4.0

Security audit hardening (Phases 8, 10, 16, 20 of the Dream/Psychic security audit):

- **R-013**: scaffold websocket auth via a `resolveWebsocketUser` helper (test-only happy path; non-test envs throw on first connection — replace with a production scheme), wire socket.io's `allowRequest` hook inline in the boilerplate websockets initializer to enforce the HTTP CORS allowlist across every transport (closing the native-WebSocket-bypasses-CORS gap), and clarify the `CORS_HOSTS` parse error in `allowedCorsOrigins` so malformed values fail loudly instead of pushing developers toward unsafe workarounds
- **R-016**: replace `execSync` with argv-form `execFileSync` in `installPsychicSkill` so shell metacharacters in developer-supplied paths are passed literally
- **R-025**: pin `path-to-regexp >=8.4.0` in the boilerplate (carrying npm `overrides` / yarn `resolutions` / pnpm `overrides` together, then pruning to the chosen package manager at scaffold time so the values cannot drift) to close GHSA-j3q9-mxjg-w52f
- **R-027**: migrate boilerplate Postgres TLS config from the deprecated `useSsl:` flag to `ssl:` so apps can opt into verified TLS (`ssl: { rejectUnauthorized: true, ca: ... }`) without the back-compat fallback to `rejectUnauthorized: false`

Other:

- improve CLAUDE.md and AGENTS.md guidance around the psychic-skill, and add front-end datetime handling guidance
- disable pnpm 11 strict-dep-builds in the lint and check-build CI jobs (CI-only; no source-tree impact) so install proceeds when esbuild and puppeteer postinstalls are skipped — they're not needed for either job

## 3.3.1

- strengthen root CLAUDE.md emphasis on the psychic-skill and project structure
- make general-purpose AGENTS.md focus on the psychic-skill

## 3.3.1

- docker-compose installs Postgres 18, which is required for uuid7, and Redis 7

## 3.3.0

- improve out-of-the-box package.json script conventions
- add `--no-` variants to each of the CLI flags so they can be explicitly set

## 3.2.0

- MaybeAuthedController pattern to handle situation in which an authenticated user may or may not be present

## 3.1.1

- fix front end scripts in boilerplate package
- remove unused expect-playwright from and bump minimum puppeteer in boilerplate package.json (fixes deprecation warnings)
- better psychic-rules demarcation in AGENTS.md

## 3.1.0

- fix for Vite 8
- prompt to install psychic-skill
- miscellaneous fixes

## 3.0.2

- CLAUDE.md

## 3.0.2

- custom .mcp.json based on whether API-only or not
- update AGENTS.md

## 3.0.1

- more idiomatic way of testing Dream constructor name
- mcp.json immediately ready to use

## 3.0.0

- psychic 3.0

- psychic 3.0

## 2.2.0

- update to @rvoh/psychic-websockets@v3.0.0
- add docker-compose boilerplate to new psychic applications

## 2.1.17

- importDefault and importAll are windows safe

## 2.1.16

- safer way to read json files with potential comments

## 2.1.15

- more comments needed to be removed

## 2.1.14

- no comments in json files

## 2.1.13

- use cross-env in package.json for windows compatibility
- fix init issue with missing boilerplate tsconfig files

## 2.1.12

- fix dev dependency installation for pnpm during init command
- ensure all latest dev/non-dev dependencies are added correctly during init

## 2.1.11

- fix broken init command when using --dream-only flag
- don't write a node-version unless their node version is recent

## 2.1.10

- javascript mcp bridge so can simply run it with node

## 2.1.9

- use specified package manager to build out sidechaining for client dev server

## 2.1.8

- fix unexpected build regressions caused by new dotfiles

## 2.1.7

- mcp bridge comment cleanup

## 2.1.6

- root level AGENTS.md
- root level .gitignore
- .prettierignore at root and in api because VSCode will only pick up the one at the root of the workspace

## 2.1.5

- leverage native postgres UUIDv4 and UUIDv7

## 2.1.4

- fix order of `declare public` in boilerplate

## 2.1.3

- fix mcp-http-bridge.ts

## 2.1.2

- switch to pnpm
- bump eslint

* make pnpm the default package manager going forward

## 2.1.1

- add typescript as explicit dependency, since it is now required for the new AST building mechanisms in dream/psychic.

## 2.1.0

- update readme to mention AGENTS.md
- fix `setupPolly` for controller specs
- Update boilerplate for latest Dream and Psychic

## 2.0.5

AGENTS.md

## 2.0.4

- bump Node to 24.11.1

## 2.0.3

- bump packages

## 2.0.2

- fix typo in readme boilerplate

## 2.0.0

- Dream & Psychic 2.0

## 1.0.16

- absolute paths

## 1.0.15

- minor fixes and gitignore/gitkeep changes
- update `setupPolly` boilerplate to record all requests by default

## 1.0.14

- fix spec boilerplate (authentication helper was pointing to legacy type file)

## 1.0.13

- RequestBody and RequestQuery in boilerplate

## 1.0.12

- bump Dream and Psychic
- ensure migrations have been run prior to spec runs
- swap arguments to db()
- nodemon

## 1.0.9

- openapi and param validation error logging in dev

## 1.0.8

- detailed openapi validation errors only in dev or test

## 1.0.7

- use new validation engine provided by psychic

## 1.0.6

- update generated db index to ensure it provides a connectionName to the underlying `untypedDb` function provided by dream, now that dream supports multiple db connections.

## 1.0.5

- add `init` command, which can be used to initialize dream/psychic into an existing typescript project, such as a nextjs app.
