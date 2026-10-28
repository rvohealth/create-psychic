import FeatureSpecHooksBuilder from '../../../src/file-builders/FeatureSpecHooksBuilder.js'
import { NewPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'

// Builds the feature-spec hooks (spec/features/setup/hooks.ts) a generated app gets.
async function buildFeatureSpecHooks({ websockets }: { websockets: boolean }): Promise<string> {
  const options: NewPsychicAppCliOptions = {
    packageManager: 'pnpm',
    workers: false,
    websockets,
    claudePsychicSkill: false,
    agentsPsychicSkill: false,
    client: 'none',
    adminClient: 'none',
    internalClient: 'none',
    primaryKeyType: 'bigint',
  }
  return FeatureSpecHooksBuilder.build(options)
}

describe('spec/features/setup/hooks.ts in a generated app', () => {
  for (const websockets of [false, true]) {
    context(websockets ? 'with websockets' : 'without websockets', () => {
      // The generated CI workflow (CiWorkflowBuilder) uploads /tmp/screenshots as an
      // artifact when the feature-spec job fails. These hooks are the only producer of
      // those screenshots — without this block, the artifact is always empty.
      it('captures a full-page screenshot to /tmp/screenshots when a spec fails', async () => {
        const hooks = await buildFeatureSpecHooks({ websockets })
        expect(hooks).toContain(`const SCREENSHOT_DIR = '/tmp/screenshots'`)
        expect(hooks).toContain(`ctx.task.result?.state === 'fail'`)
        expect(hooks).toContain('fullPage: true')
        // the directory is created on demand (CI has no mkdir step for it)
        expect(hooks).toContain('fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })')
      })

      it('captures the screenshot before resetBrowserState wipes the page', async () => {
        const hooks = await buildFeatureSpecHooks({ websockets })
        const screenshotIndex = hooks.indexOf('page.screenshot')
        const resetIndex = hooks.indexOf('await resetBrowserState()')
        expect(screenshotIndex).toBeGreaterThan(-1)
        expect(resetIndex).toBeGreaterThan(-1)
        expect(screenshotIndex).toBeLessThan(resetIndex)
      })

      it('leaves no template placeholder behind', async () => {
        const hooks = await buildFeatureSpecHooks({ websockets })
        expect(hooks).not.toMatch(/<[A-Z_]+>/)
      })
    })
  }

  context('with websockets', () => {
    // Dream gives each spec worker its own test database, and in test websockets use
    // the in-process adapter, so the websocket server must run in the spec worker,
    // started after the api server on the port src/ws.ts uses under test.
    it('starts a live websocket server in beforeAll, after the api server', async () => {
      const hooks = await buildFeatureSpecHooks({ websockets: true })
      expect(hooks).toMatch(/^import \{ Cable \} from '@rvoh\/psychic-websockets'$/m)
      expect(hooks).toMatch(/^import AppEnv from '#conf\/AppEnv\.js'$/m)
      expect(hooks).toMatch(/^let cable: Cable$/m)
      const serverStartIndex = hooks.indexOf('  await server.start(')
      const cableNewIndex = hooks.indexOf('\n  cable = new Cable()\n')
      const cableStartIndex = hooks.indexOf(
        "\n  await cable.start(AppEnv.integer('WS_PORT', { optional: true }) || 8889)\n",
      )
      expect(serverStartIndex).toBeGreaterThan(-1)
      expect(cableNewIndex).toBeGreaterThan(serverStartIndex)
      expect(cableStartIndex).toBeGreaterThan(cableNewIndex)
      expect(cableStartIndex).toBeLessThan(hooks.indexOf('beforeEach('))
    })

    // Stopping the websocket server before the api server means a failing
    // `server.stop()` cannot leave its fixed port taken when the next spec file
    // starts its own, and the `finally` stops the api server even if the
    // websocket server's stop throws.
    it('stops the websocket server before the api server, which stops even if that throws', async () => {
      const hooks = await buildFeatureSpecHooks({ websockets: true })
      const afterAll = hooks.slice(hooks.indexOf('afterAll('))
      expect(afterAll).toContain(
        `\
  try {
    await cable?.stop()
  } finally {
    await server.stop()
  }`,
      )
    })
  })

  context('without websockets', () => {
    // The app has no @rvoh/psychic-websockets (PackagejsonBuilder removes it), so the
    // hooks carry no websocket server, not even commented out.
    it('has no websocket server and no reference to psychic-websockets', async () => {
      const hooks = await buildFeatureSpecHooks({ websockets: false })
      expect(hooks).not.toContain('psychic-websockets')
      expect(hooks).not.toMatch(/cable/i)
      expect(hooks).not.toContain('AppEnv')
      expect(hooks).not.toContain('WS_PORT')
      expect(hooks).toMatch(/^afterAll\(async \(\) => \{\n {2}await server\.stop\(\)\n\}\)$/m)
    })
  })
})
