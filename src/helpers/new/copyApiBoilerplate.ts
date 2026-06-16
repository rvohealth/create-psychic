import * as fs from 'node:fs'
import * as path from 'node:path'
import AppConfigBuilder from '../../file-builders/AppConfigBuilder.js'
import BunfigBuilder from '../../file-builders/BunfigBuilder.js'
import CiWorkflowBuilder from '../../file-builders/CiWorkflowBuilder.js'
import DenoJsonBuilder from '../../file-builders/DenoJsonBuilder.js'
import DockerComposeBuilder from '../../file-builders/docker/DockerComposeBuilder.js'
import PsychicDockerDevBuilder from '../../file-builders/docker/PsychicDockerfileDevBuilder.js'
import DreamConfigBuilder from '../../file-builders/DreamConfigBuilder.js'
import EnvBuilder from '../../file-builders/EnvBuilder.js'
import FeatureSpecExampleBuilder from '../../file-builders/FeatureSpecExampleBuilder.js'
import FeatureSpecGlobalBuilder from '../../file-builders/FeatureSpecGlobalBuilder.js'
import NpmrcBuilder from '../../file-builders/NpmrcBuilder.js'
import PackagejsonBuilder from '../../file-builders/PackagejsonBuilder.js'
import SrcPathHelperBuilder from '../../file-builders/SrcPathHelperBuilder.js'
import apiOnlyOptions from '../apiOnlyOptions.js'
import copyRecursive from '../copyRecursive.js'
import frontEndPackageManager from '../frontEndPackageManager.js'
import getApiRoot from '../getApiRoot.js'
import internalSrcPath from '../internalSrcPath.js'
import { NewPsychicAppCliOptions } from '../newPsychicApp.js'
import replacePackageManagerInFile from '../replacePackageManagerInFile.js'

export default async function copyApiBoilerplate(appName: string, options: NewPsychicAppCliOptions) {
  const appRoot = path.join('.', appName)
  const apiRoot = getApiRoot(appName, options)
  // AGENTS.md / CLAUDE.md document the front-end wrapper scripts via `{{PM_CWD}}`,
  // which must resolve to the front-end PM (pnpm for a Deno API), not the runtime.
  const fePm = frontEndPackageManager(options)

  if (!apiOnlyOptions(options)) {
    fs.mkdirSync(appRoot)
    fs.cpSync(internalSrcPath('..', 'boilerplate', 'gitignore'), path.join(appRoot, '.gitignore'))
    fs.cpSync(internalSrcPath('..', 'boilerplate', 'AGENTS.md'), path.join(appRoot, 'AGENTS.md'))
    await replacePackageManagerInFile(path.join(appRoot, 'AGENTS.md'), options.packageManager, fePm)
    fs.cpSync(internalSrcPath('..', 'boilerplate', 'CLAUDE.md'), path.join(appRoot, 'CLAUDE.md'))
    await replacePackageManagerInFile(path.join(appRoot, 'CLAUDE.md'), options.packageManager, fePm)
    fs.cpSync(
      internalSrcPath('..', 'boilerplate', 'api', '.prettierignore'),
      path.join(appRoot, '.prettierignore'),
    )
  }

  copyRecursive(internalSrcPath('..', 'boilerplate', 'api'), apiRoot)

  if (apiOnlyOptions(options)) {
    fs.cpSync(internalSrcPath('..', 'boilerplate', 'api-only-mcp.json'), path.join(appRoot, '.mcp.json'))
  } else {
    fs.cpSync(internalSrcPath('..', 'boilerplate', 'non-api-only-mcp.json'), path.join(appRoot, '.mcp.json'))
  }

  fs.cpSync(internalSrcPath('..', 'boilerplate', 'README.md'), path.join(appRoot, 'README.md'))

  fs.writeFileSync(path.join(appRoot, 'docker-compose.yml'), await DockerComposeBuilder.build(options))
  fs.writeFileSync(path.join(apiRoot, 'Dockerfile.dev'), await PsychicDockerDevBuilder.build(options))

  await replacePackageManagerInFile(path.join(apiRoot, 'AGENTS.md'), options.packageManager, fePm)
  await replacePackageManagerInFile(path.join(apiRoot, 'src', 'conf', 'routes.ts'), options.packageManager)
  await replacePackageManagerInFile(
    path.join(apiRoot, 'src', 'conf', 'routes.admin.ts'),
    options.packageManager,
  )
  await replacePackageManagerInFile(
    path.join(apiRoot, 'src', 'conf', 'routes.internal.ts'),
    options.packageManager,
  )
  await replacePackageManagerInFile(path.join(appRoot, 'README.md'), options.packageManager)
  await replacePackageManagerInFile(path.join(appRoot, 'docker-compose.yml'), options.packageManager)

  // yarnrc.yml included as non-dot-file so that it becomes part of the package
  // move it to .yarnrc.yml if using yarn; otherwise, delete it
  if (options.packageManager === 'yarn') {
    fs.renameSync(path.join(apiRoot, 'yarnrc.yml'), path.join(apiRoot, '.yarnrc.yml'))
  } else {
    fs.rmSync(path.join(apiRoot, 'yarnrc.yml'))
  }

  // pnpm-workspace.yaml is pnpm-only; delete it for other package managers
  if (options.packageManager !== 'pnpm') {
    fs.rmSync(path.join(apiRoot, 'pnpm-workspace.yaml'))
  }

  // .npmrc carries registry pinning (+ npm's cooldown/script-block, which it
  // can't express in a workspace file). yarn ignores .npmrc, so none is written
  // for it; NpmrcBuilder returns null in that case.
  const npmrc = NpmrcBuilder.build(options.packageManager)
  if (npmrc !== null) {
    fs.writeFileSync(path.join(apiRoot, '.npmrc'), npmrc)
  }

  // Hardened GitHub Actions CI lives at the repo root (appRoot), with steps that
  // run from the api directory. Opt-in via the generator prompt. The generated
  // workflow is runtime-aware (setup-node/corepack for node pms, setup-bun /
  // setup-deno for those runtimes).
  if (options.githubActions) {
    const workflowsDir = path.join(appRoot, '.github', 'workflows')
    fs.mkdirSync(workflowsDir, { recursive: true })
    fs.writeFileSync(path.join(workflowsDir, 'ci.yml'), CiWorkflowBuilder.build(appName, options))
  }

  fs.renameSync(path.join(apiRoot, 'gitignore'), path.join(apiRoot, '.gitignore'))
  fs.writeFileSync(
    path.join(apiRoot, 'src', 'conf', 'system', 'srcPath.ts'),
    await SrcPathHelperBuilder.build(options),
  )

  // Runtime config. Deno and Bun get their own config files instead of `.nvmrc`:
  //   - deno.json: import map for the path aliases + sloppy-imports + node_modules dir
  //   - bunfig.toml: registry pin (+ default-deny lifecycle scripts)
  if (options.runtime === 'deno') {
    fs.writeFileSync(path.join(apiRoot, 'deno.json'), DenoJsonBuilder.build())
  } else if (options.runtime === 'bun') {
    fs.writeFileSync(path.join(apiRoot, 'bunfig.toml'), BunfigBuilder.build())
  } else {
    // Steer new Node apps toward Node 26 — Psychic's supported baseline (26 is the
    // current LTS; 25 is already EOL). This is
    // ADVISORY: `engines.node` in package.json has no engine-strict, so the app still
    // generates and installs on older Node with a warning. We write only `.nvmrc`
    // (read by nvm/fnm) and intentionally NOT `.node-version`: nodenv and asdf treat
    // `.node-version` as a hard requirement and refuse to run ANY command in the app
    // if that exact version isn't installed — which would hard-block developers still
    // on Node 24 LTS, defeating the advisory intent.
    fs.writeFileSync(path.join(apiRoot, '.nvmrc'), '26\n')
  }

  // nodemon is a Node-only dev-server tool; Deno/Bun get a native `--watch` web:dev
  // (rewritten in PackagejsonBuilder), so the copied nodemon.json is dead config there.
  if (options.runtime === 'deno' || options.runtime === 'bun') {
    fs.rmSync(path.join(apiRoot, 'nodemon.json'))
  }

  fs.writeFileSync(path.join(apiRoot, '.env'), EnvBuilder.build({ appName, env: 'development' }))
  fs.writeFileSync(path.join(apiRoot, '.env.test'), EnvBuilder.build({ appName, env: 'test' }))
  fs.writeFileSync(
    path.join(apiRoot, '.env.example'),
    EnvBuilder.buildExample({ appName, env: 'development' }),
  )
  fs.writeFileSync(path.join(apiRoot, '.env.test.example'), EnvBuilder.buildExample({ appName, env: 'test' }))
  fs.writeFileSync(path.join(apiRoot, 'package.json'), await PackagejsonBuilder.buildAPI(appName, options))

  fs.writeFileSync(
    path.join(apiRoot, 'src', 'conf', 'app.ts'),
    await AppConfigBuilder.build({ appName, options }),
  )

  fs.writeFileSync(
    path.join(apiRoot, 'src', 'conf', 'dream.ts'),
    await DreamConfigBuilder.build({ appName, options }),
  )

  fs.writeFileSync(
    path.join(apiRoot, 'spec', 'features', 'setup', 'globalSetup.ts'),
    await FeatureSpecGlobalBuilder.build({ appName, options }),
  )

  fs.writeFileSync(
    path.join(apiRoot, 'spec', 'features', 'example-feature-spec.spec.ts'),
    await FeatureSpecExampleBuilder.build(options),
  )

  if (!options.workers) {
    fs.rmSync(path.join(apiRoot, 'src', 'worker.ts'))
    fs.rmSync(path.join(apiRoot, 'src', 'conf', 'initializers', 'workers.ts'))
    fs.rmSync(path.join(apiRoot, 'src', 'types', 'workers.ts'))
    fs.rmSync(path.join(apiRoot, 'src', 'app', 'models', 'ApplicationBackgroundedModel.ts'))
    fs.rmSync(path.join(apiRoot, 'src', 'app', 'services', 'ApplicationBackgroundedService.ts'))
    fs.rmSync(path.join(apiRoot, 'src', 'app', 'services', 'ApplicationScheduledService.ts'))
  }

  if (!options.websockets) {
    fs.rmSync(path.join(apiRoot, 'src', 'ws.ts'))
    fs.rmSync(path.join(apiRoot, 'src', 'conf', 'initializers', 'websockets.ts'))
    fs.rmSync(path.join(apiRoot, 'src', 'conf', 'system', 'resolveWebsocketUser.ts'))
    fs.rmSync(path.join(apiRoot, 'src', 'utils', 'AppWs.ts'))
  }
}
