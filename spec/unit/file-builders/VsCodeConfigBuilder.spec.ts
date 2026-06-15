import VsCodeConfigBuilder from '../../../src/file-builders/VsCodeConfigBuilder.js'

describe('VsCodeConfigBuilder', () => {
  describe('.buildSettings', () => {
    it('emits valid JSON', () => {
      expect(() => {
        JSON.parse(VsCodeConfigBuilder.buildSettings())
      }).not.toThrow()
    })

    it('enables the Deno LSP so editors auto-import the .ts extension instead of .js', () => {
      const settings = JSON.parse(VsCodeConfigBuilder.buildSettings()) as Record<string, unknown>
      expect(settings['deno.enable']).toBe(true)
    })
  })

  describe('.buildExtensions', () => {
    it('emits valid JSON', () => {
      expect(() => {
        JSON.parse(VsCodeConfigBuilder.buildExtensions())
      }).not.toThrow()
    })

    it('recommends the Deno extension (deno.enable is inert without it)', () => {
      const extensions = JSON.parse(VsCodeConfigBuilder.buildExtensions()) as { recommendations: string[] }
      expect(extensions.recommendations).toContain('denoland.vscode-deno')
    })
  })
})
