import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import NextConfigBuilder from '../../../src/file-builders/NextConfigBuilder.js'

describe('NextConfigBuilder', () => {
  let tmpDir: string
  let configPath: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'next-config-test-'))
    configPath = path.join(tmpDir, 'next.config.ts')
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true })
  })

  describe('.build', () => {
    context('with empty config object', () => {
      it('adds distDir to the config', async () => {
        fs.writeFileSync(
          configPath,
          `import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
`,
        )

        const result = await NextConfigBuilder.build(configPath)

        expect(result).toContain('distDir: process.env.NEXT_DIST_DIR ?? ".next"')
        expect(result).toContain('export default nextConfig')
      })
    })

    context('with existing config properties', () => {
      it('adds distDir to the config', async () => {
        fs.writeFileSync(
          configPath,
          `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`,
        )

        const result = await NextConfigBuilder.build(configPath)

        expect(result).toContain('distDir: process.env.NEXT_DIST_DIR ?? ".next"')
        expect(result).toContain('reactStrictMode: true')
        expect(result).toContain('export default nextConfig')
      })
    })
  })
})
