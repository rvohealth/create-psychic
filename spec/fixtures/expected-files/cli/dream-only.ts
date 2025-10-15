#!/usr/bin/env node

import '../loadEnv.js'

import { DreamCLI } from '@rvoh/dream'
import { Command } from 'commander'
import seedDb from '../../db/seed.js'
import initializeDreamApp from './initializeDreamApp.js'

const program = new Command()

DreamCLI.provide(program, {
  initializeDreamApp,
  seedDb,
})

program.parse(process.argv)
