/**
 * Builds `bunfig.toml` for a Bun-targeted generated app.
 *
 * - Pins the npm registry so installs can't be silently redirected to a malicious
 *   mirror (Bun reads its registry config from bunfig.toml, not `.npmrc`).
 * - Bun does not run dependency lifecycle/postinstall scripts unless the package
 *   is listed in `trustedDependencies` in package.json — a default-deny posture
 *   equivalent to pnpm's. This app's tree needs no build scripts (esbuild ships
 *   prebuilt binaries; puppeteer's browser is installed explicitly via
 *   `bunx puppeteer browsers install`), so no allowlist is emitted. Add ONLY
 *   genuinely-needed builders to `trustedDependencies` — every entry re-opens
 *   script execution.
 */
export default class BunfigBuilder {
  public static build(): string {
    return (
      "# SECURITY — pin the registry so installs can't be silently redirected to a\n" +
      '# malicious mirror.\n' +
      '[install]\n' +
      'registry = "https://registry.npmjs.org"\n' +
      '\n' +
      '# Bun does not run dependency lifecycle/postinstall scripts unless a package is\n' +
      '# listed in `trustedDependencies` in package.json (default-deny, like pnpm).\n' +
      '# Keep that list minimal — every entry re-opens install-time script execution.\n'
    )
  }
}
