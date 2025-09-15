import * as fs from 'fs/promises'

let packageJsonBackup: string | null = null

interface PackageJsonStub {
  packageManager?: string
}

export default class PackagejsonSpecHacker {
  public static async hackPackageJson() {
    packageJsonBackup = (await fs.readFile('package.json')).toString()
    const json = JSON.parse(packageJsonBackup) as PackageJsonStub
    delete json['packageManager']

    await fs.writeFile('package.json', JSON.stringify(json, null, 2))
  }

  public static async unhackPackageJson() {
    if (!packageJsonBackup)
      throw new Error(`
        PackagejsonSpecHacker.unhackPackageJson was called, but no cache
        exists to unhack. Make sure to always call hackPackageJson before
        unhacking.
      `)

    await fs.writeFile('package.json', packageJsonBackup)
  }
}
