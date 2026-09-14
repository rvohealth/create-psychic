import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function readBoilerplateWorkersInitializer(): string {
  const path = join(
    process.cwd(),
    'boilerplate',
    'api',
    'src',
    'conf',
    'initializers',
    'workers.ts',
  )
  return readFileSync(path, 'utf8')
}

describe('boilerplate/api/src/conf/initializers/workers.ts', () => {
  it('uses one worker with concurrency ten by default without depending on host CPU count', () => {
    const initializer = readBoilerplateWorkersInitializer()
    const defaultWorkstream = initializer.match(/defaultWorkstream:\s*\{([\s\S]*?)\n\s*\},/)?.[1]

    expect(defaultWorkstream).toBeDefined()
    expect(defaultWorkstream).toMatch(/\bworkerCount:\s*1\b/)
    expect(defaultWorkstream).toMatch(/\bconcurrency:\s*10\b/)
    expect(initializer).not.toContain("from 'node:os'")
  })
})
