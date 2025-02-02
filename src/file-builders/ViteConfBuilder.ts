import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp'

export default class ViteConfBuilder {
  public static build(options: InitPsychicAppCliOptions) {
    const frameworkName = clientFrameworkName(options)

    return `
import { defineConfig } from 'vite'
import ${frameworkName} from '@vitejs/plugin-${frameworkName}'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [${frameworkName}()],
  server: {
    port: 3000,
  },
})
`
  }
}

function clientFrameworkName(options: InitPsychicAppCliOptions) {
  switch (options.client) {
    case 'react':
      return 'react'

    case 'vue':
    case 'nuxt':
      return 'vue'

    default:
      throw new Error(`unrecognized client type when determining framework name: ${options.client}`)
  }
}
