## CRITICAL: psychic-skill required

This is a Dream ORM / Psychic web framework application. You MUST use the **psychic-skill** for all development work in the `api` directory. The psychic-skill contains comprehensive, actively-maintained rules, conventions, and patterns for Dream and Psychic that must be followed. It is the single source of truth — there are no inline framework rules in this file.

## Project layout

There is **no root `package.json`**. The repo is a monorepo containing:

- `api/` — the Dream/Psychic back end. Almost every script you run is defined in `api/package.json`, and `api/` is the directory you run it from.
- One or more front-end apps in sibling directories (e.g. `client/`, `admin/`, `internal/`), each with its own `package.json`. Names and count are project-specific.

## Installing dependencies

Run `{{PM}} install` inside **each directory that has a `package.json`** — `api/` and every front-end directory. There is no root install.

## Where to run commands

**From `api/` — almost everything:**

- `{{PM}} psy <command>` — Psychic CLI (migrations, generators, `sync`, `db:reset`, etc.). Always check `{{PM}} psy <command> --help` before using a generator.
- `{{PM}} uspec`, `{{PM}} fspec`, `{{PM}} fspec:visible` — unit specs, headless feature specs, and feature specs with a visible browser. Feature specs drive the front-end apps.
- `{{PM}} web:dev`, `{{PM}} worker:dev`, `{{PM}} ws:dev` — API web server, background worker, and websocket server.
- **Front-end dev servers also launch from `api/`.** Generated projects include wrapper scripts — typically `{{PM}} client`, `{{PM}} admin`, `{{PM}} internal` (and a `:fspec` variant of each used by feature specs) — that run `{{PM_CWD}}=../<name> next dev`. **Do not `cd` into a front-end directory to start it.**
- `{{PM}} console` — Psychic REPL.
- `{{PM}} build`, `{{PM}} build:spec` — production and spec/type-check builds.
- `{{PM}} format`, `{{PM}} lint` — prettier write, and eslint + prettier check. Run `{{PM}} format` before committing.

**From a front-end directory — rare:**

Only the scripts defined in that directory's own `package.json` (e.g. `{{PM}} dev`, `{{PM}} build`, `{{PM}} lint`). Day-to-day work rarely needs these; the `api/` wrapper scripts above handle dev server startup.

## Local services

`docker-compose.yml` at the repo root provides Postgres and Redis for local development. Start them with `docker compose up -d` from the root before running specs or dev servers.

### If psychic-skill is installed

Skill-aware agents (Claude Code, Codex) auto-load the skill when they detect Dream/Psychic imports or `psy` commands — no manual invocation needed.

Agents that do not auto-load skills must read the skill's markdown files directly as prescribed reading, starting with `SKILL.md` and following the linked topic files (`models.md`, `controllers.md`, `serializers.md`, `sti.md`, `migrations.md`, `querying.md`, `testing.md`, `workers.md`, `websockets.md`, etc.). The skill lives at `.claude/skills/psychic-skill/` or `.codex/skills/psychic-skill/` — whichever is present in this repo or your home directory.

To check for updates, run `/psychic-update-skill` (Claude Code or Codex). Any agent can update manually with `git fetch origin && git reset --hard origin/main && ./setup` inside the skill directory.

### If psychic-skill is NOT installed

**Stop and install it before doing any work.**

Claude Code:

```
git clone https://github.com/daniel-nelson/psychic-skill.git .claude/skills/psychic-skill && cd .claude/skills/psychic-skill && ./setup
```

Codex:

```
git clone https://github.com/daniel-nelson/psychic-skill.git .codex/skills/psychic-skill && cd .codex/skills/psychic-skill && ./setup
```

Any other agent: clone the repo somewhere your agent will read it (e.g. `.ai/psychic-skill`) and read `SKILL.md` plus the linked topic files as prescribed reading before touching the code.

**Do not attempt to work on this codebase without the psychic-skill content available.** It contains critical rules about generators, migrations, testing, naming conventions, STI patterns, and framework APIs that cannot be safely guessed or assumed.
