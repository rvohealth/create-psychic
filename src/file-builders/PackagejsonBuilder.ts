import frontEndPackageManager from '../helpers/frontEndPackageManager.js'
import { NewPsychicAppCliOptions, PsychicPackageManager } from '../helpers/newPsychicApp.js'
import { replacePackageManagerInFileContents } from '../helpers/replacePackageManagerInFile.js'
import safelyImportJsonFile from '../helpers/safelyImportJsonFile.js'

export default class PackagejsonBuilder {
  public static async buildAPI(appName: string, options: NewPsychicAppCliOptions) {
    const imported = (await safelyImportJsonFile('../../boilerplate/api/package.json')) as { default: object }

    // parse and stringify, since node caches this package.json import,
    // which will cause subsequent changes to this import to affect other specs
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const packagejson = {
      ...JSON.parse(JSON.stringify(imported.default)),
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    packagejson.name = appName

    // The client/admin/internal wrapper scripts are FRONT-END concerns: whether to
    // forward args with `--` (npm) vs. invoke the binary directly, and which PM the
    // `{{PM_CWD}}` cross-dir command resolves to, are both properties of the
    // front-end package manager, not the API runtime. For a Deno API that's pnpm.
    const fePm = frontEndPackageManager(options)

    switch (options.client) {
      case 'none':
        break

      case 'nextjs':
        // npm requires `--` to forward CLI arguments to scripts (e.g. `npm run dev -- --port 3001`)
        // yarn and pnpm forward arguments automatically and can also invoke binaries like `next` directly.
        if (fePm === 'npm') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          packagejson.scripts['client'] = `{{PM_CWD}}=../client dev -- --port 3000`
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          packagejson.scripts['client:fspec'] =
            `BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_PUBLIC_API_URL=http://localhost:7778 NEXT_DIST_DIR=.next-fspec {{PM_CWD}}=../client dev -- --port 3050`
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          packagejson.scripts['client'] = `{{PM_CWD}}=../client next dev --port 3000`
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          packagejson.scripts['client:fspec'] =
            `BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_PUBLIC_API_URL=http://localhost:7778 NEXT_DIST_DIR=.next-fspec {{PM_CWD}}=../client next dev --port 3050`
        }
        break

      case 'nuxt':
        if (fePm === 'npm') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          packagejson.scripts['client'] = `{{PM_CWD}}=../client dev -- --port 3000`
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          packagejson.scripts['client:fspec'] =
            `BROWSER=none NUXT_BUILD_DIR=.nuxt-fspec {{PM_CWD}}=../client dev -- --port 3050`
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          packagejson.scripts['client'] = `{{PM_CWD}}=../client dev --port 3000`
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          packagejson.scripts['client:fspec'] =
            `BROWSER=none NUXT_BUILD_DIR=.nuxt-fspec {{PM_CWD}}=../client dev --port 3050`
        }
        break

      default:
        if (fePm === 'npm') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          packagejson.scripts['client'] = `{{PM_CWD}}=../client dev -- --port 3000`
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          packagejson.scripts['client:fspec'] =
            `BROWSER=none VITE_PSYCHIC_ENV=test {{PM_CWD}}=../client dev -- --port 3050`
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          packagejson.scripts['client'] = `{{PM_CWD}}=../client dev --port 3000`
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          packagejson.scripts['client:fspec'] =
            `BROWSER=none VITE_PSYCHIC_ENV=test {{PM_CWD}}=../client dev --port 3050`
        }
    }

    switch (options.adminClient) {
      case 'none':
        break

      default:
        switch (options.adminClient) {
          case 'nextjs':
            if (fePm === 'npm') {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['admin'] = `{{PM_CWD}}=../admin dev -- --port 3001`
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['admin:fspec'] =
                `BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_DIST_DIR=.next-fspec {{PM_CWD}}=../admin dev -- --port 3051`
            } else {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['admin'] = `{{PM_CWD}}=../admin next dev --port 3001`
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['admin:fspec'] =
                `BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_DIST_DIR=.next-fspec {{PM_CWD}}=../admin next dev --port 3051`
            }
            break

          case 'nuxt':
            if (fePm === 'npm') {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['admin'] = `{{PM_CWD}}=../admin dev -- --port 3001`
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['admin:fspec'] =
                `BROWSER=none NUXT_BUILD_DIR=.nuxt-fspec {{PM_CWD}}=../admin dev -- --port 3051`
            } else {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['admin'] = `{{PM_CWD}}=../admin dev --port 3001`
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['admin:fspec'] =
                `BROWSER=none NUXT_BUILD_DIR=.nuxt-fspec {{PM_CWD}}=../admin dev --port 3051`
            }
            break

          default:
            if (fePm === 'npm') {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['admin'] = `{{PM_CWD}}=../admin dev -- --port 3001`
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['admin:fspec'] =
                `BROWSER=none VITE_PSYCHIC_ENV=test {{PM_CWD}}=../admin dev -- --port 3051`
            } else {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['admin'] = `{{PM_CWD}}=../admin dev --port 3001`
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['admin:fspec'] =
                `BROWSER=none VITE_PSYCHIC_ENV=test {{PM_CWD}}=../admin dev --port 3051`
            }
        }
    }

    switch (options.internalClient) {
      case 'none':
        break

      default:
        switch (options.internalClient) {
          case 'nextjs':
            if (fePm === 'npm') {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['internal'] = `{{PM_CWD}}=../internal dev -- --port 3002`
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['internal:fspec'] =
                `BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_DIST_DIR=.next-fspec {{PM_CWD}}=../internal dev -- --port 3052`
            } else {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['internal'] = `{{PM_CWD}}=../internal next dev --port 3002`
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['internal:fspec'] =
                `BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_DIST_DIR=.next-fspec {{PM_CWD}}=../internal next dev --port 3052`
            }
            break

          case 'nuxt':
            if (fePm === 'npm') {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['internal'] = `{{PM_CWD}}=../internal dev -- --port 3002`
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['internal:fspec'] =
                `BROWSER=none NUXT_BUILD_DIR=.nuxt-fspec {{PM_CWD}}=../internal dev -- --port 3052`
            } else {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['internal'] = `{{PM_CWD}}=../internal dev --port 3002`
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['internal:fspec'] =
                `BROWSER=none NUXT_BUILD_DIR=.nuxt-fspec {{PM_CWD}}=../internal dev --port 3052`
            }
            break

          default:
            if (fePm === 'npm') {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['internal'] = `{{PM_CWD}}=../internal dev -- --port 3002`
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['internal:fspec'] =
                `BROWSER=none VITE_PSYCHIC_ENV=test {{PM_CWD}}=../internal dev -- --port 3052`
            } else {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['internal'] = `{{PM_CWD}}=../internal dev --port 3002`
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              packagejson.scripts['internal:fspec'] =
                `BROWSER=none VITE_PSYCHIC_ENV=test {{PM_CWD}}=../internal dev --port 3052`
            }
        }
    }

    if (!options.workers) {
      removeScript(packagejson, 'worker:dev')
      removeDependency(packagejson, '@rvoh/psychic-workers')
      removeDependency(packagejson, 'bullmq')
    }

    if (!options.websockets) {
      removeScript(packagejson, 'ws:dev')
      removeScript(packagejson, 'ws:fspec')
      removeDependency(packagejson, '@rvoh/psychic-websockets')
      removeDependency(packagejson, '@socket.io/redis-adapter')
      removeDependency(packagejson, '@socket.io/redis-emitter')
      removeDependency(packagejson, 'socket.io')
      removeDependency(packagejson, 'socket.io-adapter')
    }

    if (!options.workers && !options.websockets) {
      removeDependency(packagejson, 'ioredis')
    }

    pruneOverridesForPackageManager(packagejson, options.packageManager)

    if (options.packageManager === 'bun' || options.packageManager === 'deno') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      applyRuntimeRunners(packagejson.scripts, options.packageManager)
      // Strip Node-only toolchain vestiges: nodemon (Deno/Bun use a native `--watch`)
      // and tsx (their scripts run TS directly) are never invoked here, and engines.node
      // is meaningless for an app that doesn't run on Node. The matching nodemon.json is
      // removed in copyApiBoilerplate.
      removeDevDependency(packagejson, 'nodemon')
      removeDevDependency(packagejson, 'tsx')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      delete packagejson.engines
    }

    // `{{PM}}` resolves to the API runtime; `{{PM_CWD}}` (front-end client wrappers)
    // resolves to the front-end PM — they diverge only for a Deno API (→ pnpm).
    return replacePackageManagerInFileContents(
      JSON.stringify(packagejson, null, 2),
      options.packageManager,
      fePm,
    )
  }
}

// The boilerplate scripts call the Node toolchain by name — `tsx`, `node`,
// `vitest`, `nodemon`, `cross-env`. Under Bun/Deno those bare names would resolve
// to the node-shebang `.bin` shims and execute under Node, defeating the runtime
// choice, so rewrite them to run under the target runtime. The {{PM}} / {{TSC_*}}
// placeholders are handled separately by replacePackageManagerInFileContents.
//
// Verified shapes (runtime spike): `deno run -A` / `bun` for TS entrypoints,
// `deno run -A npm:vitest` / `bunx vitest` for specs, `deno run -A npm:typescript/tsc`
// / `bunx tsc` for builds. The watch (web:dev) and cross-env rewrites follow the
// same form; full per-script behavior under bun/deno is confirmed by the
// post-publish generated-app boot e2e.
function applyRuntimeRunners(scripts: Record<string, string>, runtime: 'bun' | 'deno'): void {
  // run a TS/JS entrypoint file.
  //
  // Bun auto-loads `.env` (and `.env.local` etc.) into the process before any
  // app code runs. That breaks `src/conf/loadEnv.ts`, which is written for the
  // node/tsx model where nothing pre-loads env: loadEnv defaults NODE_ENV to
  // `test` when unset and then calls `dotenv.config({ ..., override: false })`,
  // so the development values Bun already injected win and a bare `psy
  // db:migrate` silently targets the development DB instead of test. `--no-env-file`
  // disables Bun's auto-load so loadEnv is the single source of truth, identical
  // to node. Deno does not auto-load `.env`, so it needs no equivalent.
  const run = runtime === 'bun' ? 'bun --no-env-file' : 'deno run -A'
  // run an npm-published bin (vitest, cross-env, prettier, eslint)
  const bin = (name: string) => (runtime === 'bun' ? `bunx ${name}` : `deno run -A npm:${name}`)
  // hot-reloading dev server (replaces nodemon, whose nodemon.json exec is `tsx ./src/main.ts`)
  const watch =
    runtime === 'bun' ? 'bun --no-env-file --watch src/main.ts' : 'deno run -A --watch src/main.ts'

  for (const key of Object.keys(scripts)) {
    scripts[key] = scripts[key]!.replace(/nodemon --quiet --no-stdin/g, watch)
      .replace(/\bnode --version\b/g, `${runtime} --version`)
      .replace(/\bcross-env\b/g, bin('cross-env'))
      .replace(/\bvitest\b/g, bin('vitest'))
      .replace(/\btsx /g, `${run} `)
      .replace(/\bnode \.\//g, `${run} ./`)
  }

  // The bare `prettier` / `eslint` scripts are invoked via `{{PM}} <script>`; point
  // them at the runtime-native bin so they don't fall through to the Node shim.
  if (scripts['prettier'] === 'prettier') scripts['prettier'] = bin('prettier')
  if (scripts['eslint'] === 'eslint') scripts['eslint'] = bin('eslint')
}

// The boilerplate package.json carries override blocks for npm (`overrides`),
// yarn (`resolutions`), and pnpm (`pnpm.overrides`) so a single source-controlled
// file documents all three. At scaffold time we keep only the block the chosen
// package manager will actually read, so the generated app has one canonical
// spot to edit and there's no risk of the three drifting apart over time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pruneOverridesForPackageManager(packageJson: any, packageManager: PsychicPackageManager) {
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  switch (packageManager) {
    // bun reads the npm-style `overrides` block, so keep it like npm does.
    case 'npm':
    case 'bun':
      delete packageJson.resolutions
      delete packageJson.pnpm
      break
    case 'yarn':
      delete packageJson.overrides
      delete packageJson.pnpm
      break
    // deno honors neither `overrides` nor `resolutions` (and pnpm's block lives in
    // pnpm-workspace.yaml), so drop all three — same as pnpm.
    case 'pnpm':
    case 'deno':
      delete packageJson.overrides
      delete packageJson.resolutions
      delete packageJson.pnpm
      break
  }
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeDependency(packageJson: any, key: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  delete packageJson.dependencies[key]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeDevDependency(packageJson: any, key: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  delete packageJson.devDependencies[key]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeScript(packageJson: any, key: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  delete packageJson.scripts[key]
}
