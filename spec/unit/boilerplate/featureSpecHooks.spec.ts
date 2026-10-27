import { readFileSync } from 'fs'
import { join } from 'path'

// Reads the static feature-spec hooks boilerplate (copied verbatim into generated apps).
function readBoilerplateFeatureSpecHooks(): string {
  const path = join(process.cwd(), 'boilerplate', 'api', 'spec', 'features', 'setup', 'hooks.ts')
  return readFileSync(path, 'utf8')
}

describe('boilerplate/api/spec/features/setup/hooks.ts', () => {
  // The generated CI workflow (CiWorkflowBuilder) uploads /tmp/screenshots as an
  // artifact when the feature-spec job fails. These hooks are the only producer of
  // those screenshots — without this block, the artifact is always empty.
  it('captures a full-page screenshot to /tmp/screenshots when a spec fails', () => {
    const hooks = readBoilerplateFeatureSpecHooks()
    expect(hooks).toContain(`const SCREENSHOT_DIR = '/tmp/screenshots'`)
    expect(hooks).toContain(`ctx.task.result?.state === 'fail'`)
    expect(hooks).toContain('fullPage: true')
    // the directory is created on demand (CI has no mkdir step for it)
    expect(hooks).toContain('fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })')
  })

  it('captures the screenshot before resetBrowserState wipes the page', () => {
    const hooks = readBoilerplateFeatureSpecHooks()
    const screenshotIndex = hooks.indexOf('page.screenshot')
    const resetIndex = hooks.indexOf('await resetBrowserState()')
    expect(screenshotIndex).toBeGreaterThan(-1)
    expect(resetIndex).toBeGreaterThan(-1)
    expect(screenshotIndex).toBeLessThan(resetIndex)
  })

  // The commented-out websocket server listens on a fixed port. Stopping it before
  // the api server means a failing `server.stop()` cannot leave that port taken
  // when the next spec file starts its own.
  it('stops the commented-out websocket server before the api server', () => {
    const hooks = readBoilerplateFeatureSpecHooks()
    const cableStopIndex = hooks.indexOf('// await cable?.stop()')
    const serverStopIndex = hooks.indexOf('await server.stop()')
    expect(cableStopIndex).toBeGreaterThan(-1)
    expect(serverStopIndex).toBeGreaterThan(-1)
    expect(cableStopIndex).toBeLessThan(serverStopIndex)
  })
})
