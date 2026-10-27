import '#conf/loadEnv.js'

import * as fs from 'node:fs'
import initializePsychicApp from '#conf/system/initializePsychicApp.js'
import { Dream, DreamApp } from '@rvoh/dream'
import { cleanTestDb, provideDreamViteMatchers } from '@rvoh/dream-spec-helpers'
import { PsychicServer } from '@rvoh/psychic'
import { providePuppeteerViteMatchers, resetBrowserState } from '@rvoh/psychic-spec-helpers'
/** uncomment if a feature spec needs a live Ws.emit push to reach the browser */
// import { Cable } from '@rvoh/psychic-websockets'
import getPage from '#spec/features/setup/getPage.js'

provideDreamViteMatchers(Dream)
providePuppeteerViteMatchers()

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(global as any).context = describe

let server: PsychicServer
/** uncomment if a feature spec needs a live Ws.emit push to reach the browser */
// let cable: Cable

beforeAll(async () => {
  /*
   * initialize psychic
   *
   * provide your application code to psychic for initialization,
   * prior to launching your server.
   */
  await initializePsychicApp()

  /*
   * start api server
   *
   * start your api server, so that your frontend client can drive through
   * it at http://localhost:7778
   */
  server = new PsychicServer()
  await server.start(parseInt(process.env.DEV_SERVER_PORT || '7778'))

  /*
   * start websocket server
   *
   * a feature spec that needs a live Ws.emit push starts the websocket server
   * here, in the spec worker beside the api server, and never as a separate
   * process (such as a server launched from globalSetup.ts), for two reasons:
   *   - Dream gives each spec worker its own test database, so a separate
   *     process can read a different one and miss the rows a spec creates
   *   - in test, websockets use the in-process adapter (see
   *     conf/initializers/websockets.ts), so a separate process never
   *     receives a Ws.emit made in the spec worker
   */
  /** uncomment if a feature spec needs a live Ws.emit push to reach the browser */
  // cable = new Cable()
  // await cable.start(8889)

  /*
   * Launch a web browser
   *
   * User puppeteer to launch a headless (or not, if you specify HEADLESS=0)
   * browser to drive through your front end client applications.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  if (!(global as any).page) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    ;(global as any).page = await getPage()
  }
})

beforeEach(async () => {
  await cleanTestDb(DreamApp)
})

// CI uploads this directory as an artifact when a feature-spec job fails (see
// .github/workflows/ci.yml).
const SCREENSHOT_DIR = '/tmp/screenshots'

afterEach(async ctx => {
  // Capture the page before resetBrowserState wipes it, so a red spec on CI
  // comes with a picture of what the browser was showing.
  if (ctx.task.result?.state === 'fail') {
    const name = `${ctx.task.file.name}-${ctx.task.name}`.replace(/[^a-zA-Z0-9]+/g, '-')
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png`, fullPage: true })
  }

  // Reset the shared browser between specs: clears localStorage/cookies for
  // real isolation, and the about:blank navigation releases any pooled DB
  // client held by in-flight requests so server teardown isn't blocked.
  await resetBrowserState()
})

afterAll(async () => {
  // the websocket server stops first, so a failing server.stop() cannot leave
  // its fixed port taken when the next spec file starts one
  /** uncomment if a feature spec needs a live Ws.emit push to reach the browser */
  // await cable?.stop()
  await server.stop()
})
