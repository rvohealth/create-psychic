import { NewPsychicAppCliOptions, PsychicPackageManager } from './newPsychicApp.js'

/**
 * The package manager that drives the generated app's FRONT-END clients, which
 * is distinct from the API runtime (`options.packageManager`).
 *
 * Deno is a native-TypeScript *server* runtime; it adds nothing on the front end
 * (the framework bundler compiles TS→JS regardless) and carries npm-compat
 * friction, so a Deno-backed app's clients are driven by pnpm. Node uses whatever
 * package manager was chosen; Bun drives its own clients. The result is therefore
 * always one of pnpm/yarn/npm/bun — never `deno`.
 */
export default function frontEndPackageManager(options: NewPsychicAppCliOptions): PsychicPackageManager {
  return options.runtime === 'deno' ? 'pnpm' : options.packageManager
}
