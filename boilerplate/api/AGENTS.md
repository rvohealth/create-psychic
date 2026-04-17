## CRITICAL: psychic-skill required

This is a Dream ORM / Psychic web framework application. You MUST use the **psychic-skill** for all development work. The psychic-skill contains comprehensive, actively-maintained rules, conventions, and patterns for Dream and Psychic that must be followed. It is the single source of truth — there are no inline rules in this file.

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
