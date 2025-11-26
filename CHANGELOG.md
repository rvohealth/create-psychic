## 2.0.6

update readme to mention AGENTS.md

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
