## 1.0.15

- minor fixes and gitignore/gitkeep changes

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
