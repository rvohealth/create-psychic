import * as fs from 'node:fs'

export const NEXT_COMPATIBLE_TYPESCRIPT_RANGE = '^5.9.3'

type PackageJson = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export default function ensureNextCompatibleTypescript(packageJsonPath: string) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as PackageJson
  if (!pkg.dependencies?.next && !pkg.devDependencies?.next) return
  if (!pkg.devDependencies?.typescript) return

  // Next 16 checks for typescript/lib/typescript.js, which TypeScript 7 no longer ships.
  pkg.devDependencies.typescript = NEXT_COMPATIBLE_TYPESCRIPT_RANGE
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n')
}
