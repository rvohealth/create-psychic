import { visit } from '@rvoh/psychic-spec-helpers'

describe('puppeteer sample test', () => {
  it('my first puppeteer test', async () => {
    await visit('/', { baseUrl: 'http://localhost:<CLIENT_PORT>' })
    await expect(page).toMatchTextContent('<ASSERTION_TEXT>')
  })
})
