#!/usr/bin/env node

import createPsyCli from './helpers/createPsyCli.js'
import resolveCliArgv from './helpers/resolveCliArgv.js'

const program = createPsyCli()

program.parse(resolveCliArgv(process.argv))
