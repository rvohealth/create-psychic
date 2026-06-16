/**
 * Builds `bunfig.toml` for a Bun-targeted generated app.
 *
 * - Pins the npm registry so installs can't be silently redirected to a malicious
 *   mirror (Bun reads its registry config from bunfig.toml, not `.npmrc`).
 *
 * The dependency build-script block is NOT here: Bun runs install scripts for a
 * built-in allowlist of popular packages (puppeteer included) unless package.json
 * declares `trustedDependencies`, so a true deny-all needs an empty
 * `trustedDependencies: []` — set in PackagejsonBuilder, not bunfig. This app ships
 * no build scripts of its own; puppeteer's browser is installed explicitly via
 * `bunx puppeteer browsers install firefox`.
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
