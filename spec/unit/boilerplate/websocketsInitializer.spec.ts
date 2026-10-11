import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Reads the static websocket initializer template (copied verbatim into generated apps).
function readBoilerplateWebsocketsInitializer(): string {
  return readFileSync(
    join(process.cwd(), 'boilerplate', 'api', 'src', 'conf', 'initializers', 'websockets.ts'),
    'utf8',
  )
}

// The body of the one `wsApp.on('ws:connect', async socket => { ... })` hook.
function wsConnectHookBody(source: string): string {
  const body = source.match(/wsApp\.on\('ws:connect', async socket => \{([\s\S]*?)\n {2}\}\)/)?.[1]
  if (body === undefined) throw new Error("wsApp.on('ws:connect', async socket => { ... }) not found")
  return body
}

// psychic-websockets contains a throw from a ws:connect hook to the connecting socket (it logs it,
// disconnects that socket and fires ws:error). A throw from a listener a ws:start hook attaches to
// io.on('connection') is not contained: it becomes an unhandledRejection, and the generated app's
// ws.ts exits the websocket process on that. So websocket sign-in must live in a ws:connect hook.
// These checks read the template text; generated apps ship no spec for it.
describe('boilerplate/api/src/conf/initializers/websockets.ts', () => {
  it('signs in with a single ws:connect hook: resolve the user, disconnect on none, otherwise register', () => {
    const initializer = readBoilerplateWebsocketsInitializer()
    expect(initializer.match(/wsApp\.on\('ws:connect'/g)).toHaveLength(1)

    const body = wsConnectHookBody(initializer)
    const resolve = body.indexOf('const user = await resolveWebsocketUser(socket)')
    const nullGuard = body.indexOf('if (!user) {')
    const disconnect = body.indexOf('socket.disconnect(true)')
    const earlyReturn = body.indexOf('return', disconnect)
    const register = body.indexOf('await Ws.register(socket, user)')

    expect(resolve).toBeGreaterThan(-1)
    expect(nullGuard).toBeGreaterThan(resolve)
    expect(disconnect).toBeGreaterThan(nullGuard)
    expect(earlyReturn).toBeGreaterThan(disconnect)
    expect(register).toBeGreaterThan(earlyReturn)
  })

  it('attaches no ws:start hook and no io connection listener (a throw there would exit the websocket process)', () => {
    // code only: the template's comments may name these to warn against them
    const code = readBoilerplateWebsocketsInitializer()
      .split('\n')
      .filter(line => !line.trimStart().startsWith('//'))
      .join('\n')
    expect(code).toContain("wsApp.on('ws:connect'")
    expect(code).not.toContain("'ws:start'")
    expect(code).not.toMatch(/\.on\(\s*'connect(ion)?'/)
  })

  it('names no ws:start handlers as an example of where broadcasts are emitted', () => {
    expect(readBoilerplateWebsocketsInitializer()).not.toContain('ws:start handlers')
  })

  // Ws.register emits nothing; the old comment said it fired /ops/connection-success.
  it('neither sends nor promises a connection-success message', () => {
    expect(readBoilerplateWebsocketsInitializer()).not.toContain('connection-success')
  })

  // allowRequest has no containment either (engine.io calls it without a try), and it never sees
  // the socket.io auth payload the token travels in.
  it('points token checks at the ws:connect hook rather than allowRequest', () => {
    const initializer = readBoilerplateWebsocketsInitializer()
    const allowRequestComment = initializer.match(/((?:\n {4}\/\/[^\n]*)+)\n {4}allowRequest:/)?.[1]

    expect(allowRequestComment).toBeDefined()
    expect(allowRequestComment).not.toContain('auth-token inspection')
    expect(allowRequestComment).toContain('ws:connect')
  })
})
