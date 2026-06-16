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
 * NOTE: the generated `deno task` run-commands use `deno run -A` (full
 * permissions), NOT a scoped allowlist. Deno's permission flags are process-wide
 * — they can't wall third-party node_modules off from application code — so they
 * are deliberately not used as a security sandbox here. Egress/runtime lockdown
 * belongs at the infrastructure layer (see the generated SECURITY.md). Deno is a
 * supported runtime whose supply-chain posture (install-script blocking by
 * default) matches pnpm; it is not more hardened than that.
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
