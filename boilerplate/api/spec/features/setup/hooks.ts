import '@conf/loadEnv.js'

import initializePsychicApp from '@conf/system/initializePsychicApp.js'
import { Dream, DreamApp } from '@rvoh/dream'
import { provideDreamViteMatchers, truncate } from '@rvoh/dream-spec-helpers'
import { PsychicServer } from '@rvoh/psychic'
import { providePuppeteerViteMatchers } from '@rvoh/psychic-spec-helpers'
import getPage from '@spec/features/setup/getPage.js'

provideDreamViteMatchers(Dream)
providePuppeteerViteMatchers()

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(global as any).context = describe

let server: PsychicServer

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
  await truncate(DreamApp)
})

afterAll(async () => {
  /*
   * Quiesce the shared browser page before stopping the API server.
   *
   * The page launched in beforeAll is cached on `global` and reused across
   * every feature-spec file. PsychicServer.stop() tears down the database
   * connection pool (pool.end()), which only resolves once every pooled
   * client has been released. If the spec's final page is still live in the
   * headless browser, its in-flight requests can keep a pooled client
   * checked out, and pool.end() blocks until the hook times out. Navigating
   * to about:blank cancels those requests so the client is released. We
   * navigate (not close) so the cached browser stays reusable by the next
   * spec file. Best-effort — a navigation failure must not block teardown.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  const sharedPage = (global as any).page as { goto?: (url: string) => Promise<unknown> } | undefined
  await sharedPage?.goto?.('about:blank').catch(() => {})

  await server.stop()
})
