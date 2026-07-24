import * as fs from 'node:fs'

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export default function widenNextPinsForCooldown(packageJsonPath: string) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson
  let changed = false

  for (const section of ['dependencies', 'devDependencies'] as const) {
    for (const name of ['next', 'eslint-config-next']) {
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
