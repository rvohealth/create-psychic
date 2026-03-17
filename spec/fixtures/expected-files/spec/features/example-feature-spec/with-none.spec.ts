import { visit } from '@rvoh/psychic-spec-helpers'

describe('puppeteer sample test', () => {
  it('my first puppeteer test', async () => {
    await visit('/', { baseUrl: 'http://localhost:3050' })
    await expect(page).toMatchTextContent('<TEXT_FROM_YOUR_CLIENT_APP_HERE>')
  })
})
