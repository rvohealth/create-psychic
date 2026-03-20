import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import NuxtConfigBuilder from '../../../src/file-builders/NuxtConfigBuilder.js'

describe('NuxtConfigBuilder', () => {
  let tmpDir: string
  let configPath: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nuxt-config-test-'))
    configPath = path.join(tmpDir, 'nuxt.config.ts')
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true })
  })

  describe('.build', () => {
    context('with empty config object', () => {
      it('adds buildDir to the config', async () => {
        fs.writeFileSync(
          configPath,
          `// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({})
`,
        )

        const result = await NuxtConfigBuilder.build(configPath)

        expect(result).toContain('buildDir: process.env.NUXT_BUILD_DIR ?? ".nuxt"')
      })
    })

    context('with existing config properties', () => {
      it('adds buildDir to the config', async () => {
        fs.writeFileSync(
          configPath,
          `// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
})
`,
        )

        const result = await NuxtConfigBuilder.build(configPath)

        expect(result).toContain('buildDir: process.env.NUXT_BUILD_DIR ?? ".nuxt"')
        expect(result).toContain('devtools: { enabled: true }')
      })
    })
  })
})
