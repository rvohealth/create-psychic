/**
 * Builds `deno.json` for a Deno-targeted generated app.
 *
 * - `imports`: mirrors the tsconfig path aliases (`@conf`, `@src`, `@models`, …).
 *   Deno resolves bare specifiers through its own import map, not tsconfig
 *   `paths`, so without this every app import fails to resolve.
 * - `unstable: ["sloppy-imports"]`: the codebase imports `.js` specifiers that
 *   resolve to `.ts` files on disk (tsc/tsx rewrite the extension); Deno rejects
 *   that mismatch unless sloppy-imports is enabled.
 * - `nodeModulesDir: "auto"`: `deno install` materializes the npm dependency tree
 *   into a `node_modules` directory, which the framework's `node:`/npm imports
 *   (pg, bullmq, ioredis, koa, …) expect.
 *
 * Per-context permission flags (`--allow-net=…`, `--allow-env=…`, scoped
 * read/write) live in the generated package.json run-commands (`deno run …`),
 * surfaced via `deno task`, so they sit next to the other runtimes' scripts.
 */
export default class DenoJsonBuilder {
  public static build(): string {
    const denoJson = {
      imports: {
        '@conf/': './src/conf/',
        '@controllers/': './src/app/controllers/',
        '@models/': './src/app/models/',
        '@serializers/': './src/app/serializers/',
        '@services/': './src/app/services/',
        '@spec/': './spec/',
        '@src/': './src/',
      },
      unstable: ['sloppy-imports'],
      nodeModulesDir: 'auto',
    }

    return JSON.stringify(denoJson, null, 2) + '\n'
  }
}
