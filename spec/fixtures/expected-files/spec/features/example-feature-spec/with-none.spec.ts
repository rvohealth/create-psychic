import AppEnv from '@conf/AppEnv.js'
import { visit } from '@rvoh/psychic-spec-helpers'

describe('puppeteer sample test', () => {
  it('my first puppeteer test', async () => {
    await visit('/', { baseUrl: AppEnv.string('CLIENT_HOST') })
    await expect(page).toMatchTextContent('<TEXT_FROM_YOUR_CLIENT_APP_HERE>')
  })
})
