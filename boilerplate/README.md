# Welcome to your new Dream & Psychic app!

Check out [the docs](https://psychicframework.com/) or the [BearBnB demo app](https://github.com/rvohealth/bearbnb).

Perhaps [create some resources](https://psychicframework.com/docs/controllers/generating#resources)?

If you run into problems, ask questions on [Stack Overflow](https://stackoverflow.com/) using the `dream` or `psychic` tags.

### AI

This project ships with AI tooling for Dream and Psychic development.

**MCP Server** — A `.mcp.json` file is included at the project root, providing a Dream/Psychic RAG (Retrieval-Augmented Generation) server. Claude Code and Codex read this file automatically. For other MCP-compatible tools (e.g. Cursor), add the server from `.mcp.json` to your editor's MCP settings.

**Psychic-skill** — If you chose to install the psychic-skill during setup, it provides comprehensive rules and conventions for Dream and Psychic development. Claude Code loads it automatically; see `.claude/skills/psychic-skill`. For Codex, see `.codex/skills/psychic-skill`.

**AI rules** — `./api/AGENTS.md`\* contains AI development rules for Dream and Psychic applications. These rules may be customized by adding to the bottom of the file. To update to the latest official rules, use `{{PM}} psy sync:ai-rules`.

\* if this Psychic app was created without a front-end client, then these files are in the project root
