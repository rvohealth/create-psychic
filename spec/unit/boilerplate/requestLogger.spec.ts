import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { FILTERED } from '../../../boilerplate/api/src/conf/system/redactForLog.js'
import requestLogger from '../../../boilerplate/api/src/conf/system/requestLogger.js'

// create-psychic's own install has neither winston nor koa. requestLogger.ts imports koa for types
// only, and winston only to build a logger when none is passed in; every case here passes its own
// `winstonInstance`, so this empty module stands in for winston and is never called.
vi.mock('winston', () => ({ default: {} }))

// The body blocklist the scaffold passes to requestLogger (`SENSITIVE_FIELDS` in conf/app.ts).
function scaffoldBodyBlocklist(): string[] {
  const appConf = readFileSync(join(process.cwd(), 'boilerplate', 'api', 'src', 'conf', 'app.ts'), 'utf8')
  const list = appConf.match(/const SENSITIVE_FIELDS = \[([^\]]*)\]/)?.[1]
  if (list === undefined) throw new Error('SENSITIVE_FIELDS not found in conf/app.ts')
  return [...list.matchAll(/'([^']*)'/g)].map(match => match[1] ?? '')
}

interface LogEntry {
  message: string
  level: string
  meta: { req: { method: string; url: string; headers: Record<string, unknown> }; res: { statusCode: number } }
}

// The parts of a Koa context requestLogger reads.
interface LoggedContext {
  method: string
  url: string
  path: string
  status: number
  params?: unknown
  routerPath?: unknown
  headers: Record<string, unknown>
  request: { body?: unknown }
}

type Middleware = (ctx: LoggedContext, next: () => Promise<void>) => Promise<void>

// What the rest of the app leaves on the context by the time `next()` returns: the response
// status and, when the path matched a route that takes the request's method, the route
// parameters @koa/router bound in `ctx.params` (decoded) and the matched route's path in
// `ctx.routerPath`. Koa, @koa/router and Psychic are not run here; each case binds what a
// generated app's PsychicServer (psychic 3.18.1, Koa 3.2.1, @koa/router 15.7.0) binds for that
// request.
interface Outcome {
  status: number
  route?: { path: string; params: Record<string, string> }
  headers?: Record<string, unknown>
}

async function logRequest(method: string, url: string, outcome: Outcome): Promise<LogEntry> {
  const entries: unknown[] = []
  const middleware = requestLogger({
    winstonInstance: { log: (entry: unknown) => entries.push(entry) },
    bodyBlocklist: scaffoldBodyBlocklist(),
  }) as Middleware

  const ctx: LoggedContext = {
    method,
    url,
    path: url.split('?')[0] ?? url,
    status: 404,
    headers: outcome.headers ?? {},
    request: {},
  }
  await middleware(ctx, () => {
    if (outcome.route) {
      ctx.params = outcome.route.params
      ctx.routerPath = outcome.route.path
    }
    ctx.status = outcome.status
    return Promise.resolve()
  })

  expect(entries).toHaveLength(1)
  return entries[0] as LogEntry
}

describe('boilerplate/api/src/conf/system/requestLogger.ts', () => {
  it('masks a path segment bound to a route parameter whose name contains a listed name', async () => {
    const entry = await logRequest('GET', '/password-resets/k3yV4lue?page=2', {
      status: 200,
      route: { path: '/password-resets/:token', params: { token: 'k3yV4lue' } },
    })

    expect(entry.message).toMatch(/^GET \/password-resets\/\[FILTERED\]\?page=2 200 \d+ms$/)
    expect(entry.meta.req.url).toBe(`/password-resets/${FILTERED}?page=2`)
    expect(JSON.stringify(entry)).not.toContain('k3yV4lue')
  })

  it('logs the values of other route parameters as sent, with the query string masked', async () => {
    const entry = await logRequest('GET', '/v1/places/42/bookings/7?token=q', {
      status: 200,
      route: { path: '/v1/places/:placeId/bookings/:id', params: { placeId: '42', id: '7' } },
    })

    expect(entry.meta.req.url).toBe(`/v1/places/42/bookings/7?token=${FILTERED}`)
  })

  // psychic's `r.namespace('v1', r => r.resources('api-tokens', r => r.resources('usages')))` names
  // the parent's key `:apiTokenId`
  it("masks only the segment of a nested route's listed-name parameter, keeping the child id and `v1`", async () => {
    const route = '/v1/api-tokens/:apiTokenId/usages/:id'

    expect(
      (
        await logRequest('GET', '/v1/api-tokens/42/usages/1420', {
          status: 200,
          route: { path: route, params: { apiTokenId: '42', id: '1420' } },
        })
      ).meta.req.url,
    ).toBe(`/v1/api-tokens/${FILTERED}/usages/1420`)
    expect(
      (
        await logRequest('GET', '/v1/api-tokens/1/usages/7', {
          status: 200,
          route: { path: route, params: { apiTokenId: '1', id: '7' } },
        })
      ).meta.req.url,
    ).toBe(`/v1/api-tokens/${FILTERED}/usages/7`)
  })

  it('masks a route parameter named like `tokenId`', async () => {
    const entry = await logRequest('DELETE', '/v1/api-tokens/12', {
      status: 204,
      route: { path: '/v1/api-tokens/:tokenId', params: { tokenId: '12' } },
    })

    expect(entry.meta.req.url).toBe(`/v1/api-tokens/${FILTERED}`)
  })

  it('masks every segment a splat value spans', async () => {
    const entry = await logRequest('GET', '/files/a/b%20c', {
      status: 200,
      route: { path: '/files/*secretPath', params: { secretPath: 'a/b c' } },
    })

    expect(entry.meta.req.url).toBe(`/files/${FILTERED}/${FILTERED}`)
  })

  it('masks the whole segment when the value is only part of one', async () => {
    const entry = await logRequest('GET', '/v/x-s3cret', {
      status: 200,
      route: { path: '/v/:a-:tokenPart', params: { a: 'x', tokenPart: 's3cret' } },
    })

    expect(entry.meta.req.url).toBe(`/v/${FILTERED}`)
  })

  it('masks the path of a matched route that responds 404', async () => {
    const entry = await logRequest('GET', '/password-resets/k3yV4lue', {
      status: 404,
      route: { path: '/password-resets/:token', params: { token: 'k3yV4lue' } },
    })

    expect(entry.meta.req.url).toBe(`/password-resets/${FILTERED}`)
    expect(entry.level).toBe('warn')
  })

  it('masks the path of a request that ends in a 500', async () => {
    const entry = await logRequest('GET', '/v1/guests/9/invitations/s%2Fx', {
      status: 500,
      route: {
        path: '/v1/guests/:guestId/invitations/:invitationToken',
        params: { guestId: '9', invitationToken: 's/x' },
      },
    })

    expect(entry.meta.req.url).toBe(`/v1/guests/9/invitations/${FILTERED}`)
    expect(entry.level).toBe('error')
  })

  it('logs a path that matches no route (a 404) as received, with the query string masked', async () => {
    const entry = await logRequest('GET', '/password-reset/k3yV4lue?token=q', { status: 404 })

    expect(entry.meta.req.url).toBe(`/password-reset/k3yV4lue?token=${FILTERED}`)
    expect(entry.level).toBe('warn')
  })

  it('logs a request with a method its route does not take (a 405, or OPTIONS) as received', async () => {
    // @koa/router binds no `ctx.params` when only the path matched; its allowedMethods() answers
    expect((await logRequest('POST', '/password-resets/k3yV4lue', { status: 405 })).meta.req.url).toBe(
      '/password-resets/k3yV4lue',
    )
    expect((await logRequest('OPTIONS', '/password-resets/k3yV4lue', { status: 200 })).meta.req.url).toBe(
      '/password-resets/k3yV4lue',
    )
  })

  it('logs a request that middleware answers before the router runs (such as a 429) as received', async () => {
    // a rate limiter mounted after the logger answers without calling `next()`, so the router
    // binds neither `ctx.params` nor `ctx.routerPath`
    const entry = await logRequest('GET', '/password-resets/k3yV4lue?token=q', { status: 429 })

    expect(entry.meta.req.url).toBe(`/password-resets/k3yV4lue?token=${FILTERED}`)
    expect(entry.level).toBe('warn')
  })

  it("logs the referer's path as received, with its query string masked", async () => {
    const entry = await logRequest('GET', '/password-resets/k3yV4lue', {
      status: 200,
      route: { path: '/password-resets/:token', params: { token: 'k3yV4lue' } },
      headers: { referer: 'https://app.example.com/reset-password/k3yV4lue?token=k3yV4lue&step=2' },
    })

    expect(entry.meta.req.url).toBe(`/password-resets/${FILTERED}`)
    expect(entry.meta.req.headers.referer).toBe(
      `https://app.example.com/reset-password/k3yV4lue?token=${FILTERED}&step=2`,
    )
  })
})
