#!/usr/bin/env node

import createPsyCli from './helpers/createPsyCli.js'

const program = createPsyCli()

const maybeInitCommand = process.argv.at(2)

if (maybeInitCommand === 'init') {
  program.parse([
    '', // override the name of the executed script (i.e. ~/.nodenv/versions/20.9.0/bin/node),
    '', // override the name of the file being called (i.e. create-psychic/src/bin.ts)
    'init', // manually inject the new arg, since it would have been omitted when calling bin
    ...process.argv.slice(3), // the remaining cli args,
  ])
} else {
  program.parse([
    '', // override the name of the executed script (i.e. ~/.nodenv/versions/20.9.0/bin/node),
    '', // override the name of the file being called (i.e. create-psychic/src/bin.ts)
    'new', // manually inject the new arg, since it would have been omitted when calling bin
    ...process.argv.slice(2), // the remaining cli args,
  ])
}
