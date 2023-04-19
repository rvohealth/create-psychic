import { PsychicServer } from 'psychic'
const server = new PsychicServer()

describe('ensure puppeteer is working', () => {
  beforeAll(async () => {
    await server.boot()
  })

  it('accepts the request', async () => {
    await page.goto('http://localhost:3000')
    await expect(page).toMatchTextContent('hello: world')
  })
})
