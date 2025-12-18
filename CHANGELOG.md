## 2.1.11

fix broken init command when using --dream-only flag

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
