import NpmrcBuilder from '../../../src/file-builders/NpmrcBuilder.js'

describe('NpmrcBuilder', () => {
  describe('.build', () => {
    context('yarn', () => {
      it('returns null (yarn reads .yarnrc.yml, not .npmrc)', () => {
        expect(NpmrcBuilder.build('yarn')).toBeNull()
      })
    })

    context('pnpm', () => {
      it('pins the registry', () => {
        const res = NpmrcBuilder.build('pnpm') as string
        expect(res).toContain('registry=https://registry.npmjs.org')
        expect(res).toContain('@rvoh:registry=https://registry.npmjs.org')
      })

      it('writes only the registry settings (pnpm 11+ reads its cooldown from pnpm-workspace.yaml)', () => {
        const res = NpmrcBuilder.build('pnpm') as string
        const settings = res
          .split('\n')
          .filter(line => line.trim() !== '' && !line.trimStart().startsWith('#'))
        expect(settings).toEqual([
          'registry=https://registry.npmjs.org',
          '@rvoh:registry=https://registry.npmjs.org',
        ])
      })
    })

    context('npm', () => {
      it('pins the registry', () => {
        const res = NpmrcBuilder.build('npm') as string
        expect(res).toContain('registry=https://registry.npmjs.org')
        expect(res).toContain('@rvoh:registry=https://registry.npmjs.org')
      })

      it('sets a 3-day cooldown and blocks all dependency scripts', () => {
        const res = NpmrcBuilder.build('npm') as string
        expect(res).toContain('min-release-age=3')
        expect(res).toContain('ignore-scripts=true')
      })
    })

    context('deno', () => {
      it('pins the registry (Deno reads .npmrc for registry/scopes)', () => {
        const res = NpmrcBuilder.build('deno') as string
        expect(res).toContain('registry=https://registry.npmjs.org')
        expect(res).toContain('@rvoh:registry=https://registry.npmjs.org')
      })
    })

    context('bun', () => {
      it('returns null (Bun reads bunfig.toml, not .npmrc)', () => {
        expect(NpmrcBuilder.build('bun')).toBeNull()
      })
    })
  })
})
