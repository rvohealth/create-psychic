import BunfigBuilder from '../../../src/file-builders/BunfigBuilder.js'

describe('BunfigBuilder', () => {
  describe('.build', () => {
    it('pins the registry under [install]', () => {
      const res = BunfigBuilder.build()
      expect(res).toContain('[install]')
      expect(res).toContain('registry = "https://registry.npmjs.org"')
    })

    it('documents the default-deny lifecycle-script posture (trustedDependencies)', () => {
      const res = BunfigBuilder.build()
      expect(res).toContain('trustedDependencies')
    })
  })
})
