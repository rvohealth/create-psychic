import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp.js'

export default class ViteConfBuilder {
  public static build(client: InitPsychicAppCliOptions['client']) {
    const frameworkName = clientFrameworkName(client)

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

function clientFrameworkName(client: InitPsychicAppCliOptions['client']) {
  switch (client) {
    case 'react':
      return 'react'

    case 'vue':
    case 'nuxt':
      return 'vue'

    default:
      throw new Error(`unrecognized client type when determining framework name: ${client}`)
  }
}
