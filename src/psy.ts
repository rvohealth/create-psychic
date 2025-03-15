#!/usr/bin/env node

import createPsyCli from './helpers/createPsyCli.js.js'

const program = createPsyCli()
program.parse()
