import { readFileSync } from 'fs'
import { join } from 'path'

// Reads a static entry-point boilerplate file (copied verbatim into generated apps).
function readBoilerplateEntryPoint(filename: string): string {
  const path = join(process.cwd(), 'boilerplate', 'api', 'src', filename)
  return readFileSync(path, 'utf8')
}

// All three entry points must share the same observable fatal behavior: a startup
// failure or fatal process error logs and exits nonzero. The boot path may not have
// a configured logger yet, so a console fallback in the start .catch is acceptable.
describe('boilerplate entry points (src/main.ts, src/worker.ts, src/ws.ts)', () => {
  context('src/main.ts', () => {
    it('exits nonzero when the start function rejects', () => {
      const main = readBoilerplateEntryPoint('main.ts')
      expect(main).toContain('start().catch(')
      expect(main).toContain('process.exit(1)')
      expect(main).not.toContain('void start()')
    })

    it('installs fatal process handlers that log, gracefully stop the server, and exit 1', () => {
      const main = readBoilerplateEntryPoint('main.ts')
      expect(main).toContain(`process.on('uncaughtException'`)
      expect(main).toContain(`process.on('unhandledRejection'`)
      expect(main).toContain('await server.stop()')
    })

    it('does not install its own signal handlers (PsychicServer#start installs SIGINT/SIGTERM handlers)', () => {
      const main = readBoilerplateEntryPoint('main.ts')
      expect(main).not.toContain(`process.on('SIGINT'`)
      expect(main).not.toContain(`process.on('SIGTERM'`)
    })
  })

  context('src/worker.ts', () => {
    it('exits nonzero when the start function rejects', () => {
      const worker = readBoilerplateEntryPoint('worker.ts')
      expect(worker).toContain('startBackgroundWorkers().catch(')
      expect(worker).toContain('process.exit(1)')
      expect(worker).not.toContain('void startBackgroundWorkers()')
    })

    it('does not duplicate fatal handlers (background.work() installs exiting uncaughtException/unhandledRejection handlers)', () => {
      const worker = readBoilerplateEntryPoint('worker.ts')
      expect(worker).not.toContain(`process.on('uncaughtException'`)
      expect(worker).not.toContain(`process.on('unhandledRejection'`)
    })
  })

  context('src/ws.ts', () => {
    it('exits nonzero when the start function rejects', () => {
      const ws = readBoilerplateEntryPoint('ws.ts')
      expect(ws).toContain('startWs().catch(')
      expect(ws).toContain('process.exit(1)')
      expect(ws).not.toContain('void startWs()')
    })

    it('keeps its fatal process handlers (Cable does not install them)', () => {
      const ws = readBoilerplateEntryPoint('ws.ts')
      expect(ws).toContain(`process.on('uncaughtException'`)
      expect(ws).toContain(`process.on('unhandledRejection'`)
    })
  })
})
