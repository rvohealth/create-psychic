describe('ensure puppeteer is working', () => {
  it('accepts the request', async () => {
    await page.goto('http://localhost:3000')
    await expect(page).toMatchTextContent('hello: world')
  })
})
