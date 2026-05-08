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
