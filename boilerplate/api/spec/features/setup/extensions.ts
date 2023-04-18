import './globals.d.ts'

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveUrl(expected: string): Promise<R>
    }
  }
}

expect.extend({
  async toHaveUrl(url: string) {
    const pass = await page.waitForFunction("window.location.pathname === '/'")
    if (pass) {
      return {
        message: () => `expected page not to have url ${url}`,
        pass: true
      }
    }

    return {
      message: () => `expected page to have url ${url}`,
      pass: false
    }
  }
})
