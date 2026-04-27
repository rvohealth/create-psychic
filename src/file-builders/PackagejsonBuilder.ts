import { NewPsychicAppCliOptions } from '../helpers/newPsychicApp.js'
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

    switch (options.client) {
      case 'none':
        break

      case 'nextjs':
        // npm requires `--` to forward CLI arguments to scripts (e.g. `npm run dev -- --port 3001`)
        // yarn and pnpm forward arguments automatically and can also invoke binaries like `next` directly.
        if (options.packageManager === 'npm') {
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
        if (options.packageManager === 'npm') {
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
        if (options.packageManager === 'npm') {
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
            if (options.packageManager === 'npm') {
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
            if (options.packageManager === 'npm') {
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
            if (options.packageManager === 'npm') {
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
            if (options.packageManager === 'npm') {
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
            if (options.packageManager === 'npm') {
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
            if (options.packageManager === 'npm') {
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

    return replacePackageManagerInFileContents(JSON.stringify(packagejson, null, 2), options.packageManager)
  }
}

// The boilerplate package.json carries override blocks for npm (`overrides`),
// yarn (`resolutions`), and pnpm (`pnpm.overrides`) so a single source-controlled
// file documents all three. At scaffold time we keep only the block the chosen
// package manager will actually read, so the generated app has one canonical
// spot to edit and there's no risk of the three drifting apart over time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pruneOverridesForPackageManager(packageJson: any, packageManager: 'npm' | 'yarn' | 'pnpm') {
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  switch (packageManager) {
    case 'npm':
      delete packageJson.resolutions
      delete packageJson.pnpm
      break
    case 'yarn':
      delete packageJson.overrides
      delete packageJson.pnpm
      break
    case 'pnpm':
      delete packageJson.overrides
      delete packageJson.resolutions
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
function removeScript(packageJson: any, key: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  delete packageJson.scripts[key]
}
