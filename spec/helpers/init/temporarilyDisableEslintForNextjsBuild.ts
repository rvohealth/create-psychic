import temporarilySwapNextjsConfig from './temporarilySwapNextjsConfig.js'

export default async function temporarilyDisableEslintForNextjsBuild(cb: () => void | Promise<void>) {
  await temporarilySwapNextjsConfig(
    `\
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
`,
    cb
  )
}
