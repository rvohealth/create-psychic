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

      it('does NOT set ignore-scripts or min-release-age (those live in pnpm-workspace.yaml)', () => {
        const res = NpmrcBuilder.build('pnpm') as string
        expect(res).not.toContain('ignore-scripts')
        expect(res).not.toContain('min-release-age')
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

      it('does NOT set ignore-scripts (Deno blocks build scripts by default)', () => {
        const res = NpmrcBuilder.build('deno') as string
        expect(res).not.toContain('ignore-scripts')
      })
    })

    context('bun', () => {
      it('returns null (Bun reads bunfig.toml, not .npmrc)', () => {
        expect(NpmrcBuilder.build('bun')).toBeNull()
      })
    })
  })
})
