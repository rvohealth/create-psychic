import DenoJsonBuilder from '../../../src/file-builders/DenoJsonBuilder.js'

describe('DenoJsonBuilder', () => {
  describe('.build', () => {
    it('emits valid JSON', () => {
      expect(() => {
        JSON.parse(DenoJsonBuilder.build())
      }).not.toThrow()
    })

    it('maps the path aliases to an import map (Deno ignores tsconfig paths)', () => {
      const denoJson = JSON.parse(DenoJsonBuilder.build()) as { imports: Record<string, string> }
      expect(denoJson.imports).toMatchObject({
        '@conf/': './src/conf/',
        '@models/': './src/app/models/',
        '@controllers/': './src/app/controllers/',
        '@serializers/': './src/app/serializers/',
        '@services/': './src/app/services/',
        '@spec/': './spec/',
        '@src/': './src/',
      })
    })

    it('enables sloppy-imports (the codebase imports .js specifiers that resolve to .ts)', () => {
      const denoJson = JSON.parse(DenoJsonBuilder.build()) as { unstable: string[] }
      expect(denoJson.unstable).toContain('sloppy-imports')
    })

    it('materializes a node_modules dir for the npm dependency tree', () => {
      const denoJson = JSON.parse(DenoJsonBuilder.build()) as { nodeModulesDir: string }
      expect(denoJson.nodeModulesDir).toBe('auto')
    })
  })
})
