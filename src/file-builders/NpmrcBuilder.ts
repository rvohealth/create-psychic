import { PsychicPackageManager } from '../helpers/newPsychicApp.js'

/**
 * Builds the `.npmrc` for a generated app, hardened to the chosen package
 * manager's ceiling.
 *
 * - **pnpm** reads `.npmrc` for registry config but takes its supply-chain
 *   cooldown (`minimumReleaseAge`) and build-script allowlist from
 *   `pnpm-workspace.yaml`, so its `.npmrc` only pins the registry.
 * - **npm** has no per-package cooldown exclude and no per-package script
 *   carve-out, so its hardening is all-or-nothing: `min-release-age` (npm >= 11.10,
 *   in DAYS) plus `ignore-scripts=true`.
 * - **yarn** ignores `.npmrc` entirely (it reads `.yarnrc.yml`), so no file is
 *   emitted — `build` returns `null`.
 */
export default class NpmrcBuilder {
  public static build(packageManager: PsychicPackageManager): string | null {
    switch (packageManager) {
      case 'yarn':
        // Yarn reads .yarnrc.yml, not .npmrc — nothing to emit here.
        return null

      case 'pnpm':
        return (
          registryPinning() +
          '\n' +
          '# Supply-chain cooldown and dependency build-script blocking are configured in\n' +
          '# pnpm-workspace.yaml (minimumReleaseAge + the default script-block), which is\n' +
          '# where pnpm reads them.\n'
        )

      case 'npm':
        return (
          registryPinning() +
          '\n' +
          "# SECURITY — don't install dependency versions published in the last 3 days. Most\n" +
          '# worm-injected releases are caught and unpublished inside that window. NOTE:\n' +
          '# `min-release-age` requires npm >= 11.10 (Feb 2026) and is measured in DAYS\n' +
          '# (older npm ignores it with a warning). Unlike pnpm/yarn, npm has no\n' +
          '# per-package cooldown exclude — the gate applies to every dependency.\n' +
          'min-release-age=3\n' +
          '\n' +
          '# SECURITY — block ALL dependency build/postinstall scripts (the primary\n' +
          "# install-time attack vector for Shai-Hulud-class npm worms). npm's flag is\n" +
          "# all-or-nothing; this app ships no lifecycle scripts of its own, and puppeteer's\n" +
          '# browser is installed explicitly via `npx puppeteer browsers install`.\n' +
          'ignore-scripts=true\n'
        )
    }
  }
}

function registryPinning(): string {
  // SECURITY — pin the registry so installs can't be silently redirected to a
  // malicious mirror.
  return (
    "# SECURITY — pin the registry so installs can't be silently redirected to a\n" +
    '# malicious mirror.\n' +
    'registry=https://registry.npmjs.org\n' +
    '@rvoh:registry=https://registry.npmjs.org\n'
  )
}
