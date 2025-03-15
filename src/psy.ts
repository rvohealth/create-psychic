#!/usr/bin/env node

import createPsyCli from './helpers/createPsyCli.js'

const program = createPsyCli()
program.parse()
