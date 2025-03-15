import { launchPage } from '@rvoh/psychic-spec-helpers'
import { LaunchOptions, Page } from 'puppeteer'

let page: Page

export default async function getPage(opts?: LaunchOptions) {
  if (!page) {
    page = await launchPage({
      headless: process.env.HEADLESS !== '0',
      timeout: process.env.DEBUG === '1' ? 40000 : 20000,
      dumpio: process.env.DEBUG === '1',
      devtools: process.env.DEBUG === '1',
      ...opts,
    })

    // set the browser dimensions prior to running specs
    await page.setViewport({ width: 1200, height: 800 })
  }

  return page
}
