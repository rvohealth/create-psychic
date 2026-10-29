import * as fs from 'node:fs'

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

// create-next-app exact-pins the just-published `next` and `eslint-config-next`.
export default function widenNextPinsForCooldown(packageJsonPath: string) {
  widenPinsForCooldown(packageJsonPath, ['next', 'eslint-config-next'])
}

/**
 * Widens each named dependency to its full major range (`16.2.11` or `^4.6.3`
 * becomes `^16.0.0` or `^4.0.0`), so a release-age cooldown can install the
 * newest mature release in that major. A scaffolder that pins or floors a
 * package at a release still under the cooldown otherwise leaves the install
 * no version it may pick.
 */
export function widenPinsForCooldown(packageJsonPath: string, packageNames: readonly string[]) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson
  let changed = false

  for (const section of ['dependencies', 'devDependencies'] as const) {
    for (const name of packageNames) {
      const version = pkg[section]?.[name]
      if (typeof version !== 'string') continue

      const major = version.match(/\d+/)?.[0]
      if (!major) continue

      const matureRange = `^${major}.0.0`
      if (version === matureRange) continue

      pkg[section]![name] = matureRange
      changed = true
    }
  }

  if (changed) fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n')
}
