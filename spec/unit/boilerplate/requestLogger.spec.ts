import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { FILTERED } from '../../../boilerplate/api/src/conf/system/redactForLog.js'
import requestLogger from '../../../boilerplate/api/src/conf/system/requestLogger.js'

// create-psychic's own install has neither winston nor koa. requestLogger.ts imports koa for types
// only, and winston only to build a logger when none is passed in; every case here passes its own
// `winstonInstance`, so this empty module stands in for winston and is never called.
vi.mock('winston', () => ({ default: {} }))

// A string list the scaffold passes to requestLogger in conf/app.ts, such as `SENSITIVE_FIELDS`.
function scaffoldList(pattern: RegExp): string[] {
  const appConf = readFileSync(join(process.cwd(), 'boilerplate', 'api', 'src', 'conf', 'app.ts'), 'utf8')
  const list = appConf.match(pattern)?.[1]
  if (list === undefined) throw new Error(`${String(pattern)} not found in conf/app.ts`)
  return [...list.matchAll(/'([^']*)'/g)].map(match => match[1] ?? '')
}

interface LogEntry {
  message: string
  level: string
  meta: {
    req: { method: string; path: string; query: unknown; headers: Record<string, unknown> }
    res: { statusCode: number }
  }
}

// The parts of a Koa context requestLogger reads.
interface LoggedContext {
  method: string
  path: string
  query: unknown
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

// ctx.query as Koa 3 parses it (koa/lib/search-params.js): a repeated key's values become an array
function koaQuery(querystring: string): Record<string, string | string[]> {
  const searchParams = new URLSearchParams(querystring)
  const query: Record<string, string | string[]> = {}
  for (const key of searchParams.keys()) {
    const values = searchParams.getAll(key)
    query[key] = values.length <= 1 ? (values[0] ?? '') : values
  }
  return query
}

async function logRequest(method: string, url: string, outcome: Outcome): Promise<LogEntry> {
  const entries: unknown[] = []
  const middleware = requestLogger({
    winstonInstance: { log: (entry: unknown) => entries.push(entry) },
    bodyBlocklist: scaffoldList(/const SENSITIVE_FIELDS = \[([^\]]*)\]/),
    headerBlocklist: scaffoldList(/headerBlocklist: \[([^\]]*)\]/),
  }) as Middleware

  const [path = url, querystring = ''] = url.split('?')
  const ctx: LoggedContext = {
    method,
    path,
    query: koaQuery(querystring),
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
  it("masks a listed-name route parameter's value in the path, and logs the query apart", async () => {
    const entry = await logRequest('GET', '/password-resets/k3yV4lue?page=2', {
      status: 200,
      route: { path: '/password-resets/:token', params: { token: 'k3yV4lue' } },
    })

    expect(entry.message).toMatch(/^GET \/password-resets\/\[FILTERED\] 200 \d+ms$/)
    expect(entry.meta.req.path).toBe(`/password-resets/${FILTERED}`)
    expect(entry.meta.req.query).toEqual({ page: '2' })
    expect(JSON.stringify(entry)).not.toContain('k3yV4lue')
  })

  it('logs the values of other route parameters as sent, with the query masked', async () => {
    const entry = await logRequest('GET', '/v1/places/42/bookings/7?token=q&page=2', {
      status: 200,
      route: { path: '/v1/places/:placeId/bookings/:id', params: { placeId: '42', id: '7' } },
    })

    expect(entry.meta.req.path).toBe('/v1/places/42/bookings/7')
    expect(entry.meta.req.query).toEqual({ token: FILTERED, page: '2' })
  })

  // psychic's `r.namespace('v1', r => r.resources('api-tokens', r => r.resources('usages')))` names
  // the parent's key `:apiTokenId`
  it("keeps a nested route's child id in the path", async () => {
    const apiTokenId = '0199f3a2-7c1e-7b40-9d6e-2f4a8c1b5e07'
    const id = '0199f3a2-8d2f-7c51-ae7f-3a5b9d2c6f18'
    const entry = await logRequest('GET', `/v1/api-tokens/${apiTokenId}/usages/${id}`, {
      status: 200,
      route: { path: '/v1/api-tokens/:apiTokenId/usages/:id', params: { apiTokenId, id } },
    })

    expect(entry.meta.req.path).toBe(`/v1/api-tokens/${FILTERED}/usages/${id}`)
  })

  it('masks the path of a matched route that responds 404 or 500', async () => {
    const notFound = await logRequest('GET', '/password-resets/k3yV4lue', {
      status: 404,
      route: { path: '/password-resets/:token', params: { token: 'k3yV4lue' } },
    })
    const failed = await logRequest('GET', '/v1/guests/9/invitations/s%2Fx', {
      status: 500,
      route: {
        path: '/v1/guests/:guestId/invitations/:invitationToken',
        params: { guestId: '9', invitationToken: 's/x' },
      },
    })

    expect(notFound.meta.req.path).toBe(`/password-resets/${FILTERED}`)
    expect(notFound.level).toBe('warn')
    expect(failed.meta.req.path).toBe(`/v1/guests/9/invitations/${FILTERED}`)
    expect(failed.level).toBe('error')
  })

  it('logs a path the router bound no parameters for as received, with the query masked', async () => {
    // no route (a 404); only the path matched (a 405, or OPTIONS, which @koa/router's
    // allowedMethods() answers); or middleware answered before the router ran (such as a 429)
    for (const [method, status] of [
      ['GET', 404],
      ['POST', 405],
      ['OPTIONS', 200],
      ['GET', 429],
    ] as const) {
      const entry = await logRequest(method, '/password-resets/k3yV4lue?token=q', { status })
      expect(entry.meta.req.path).toBe('/password-resets/k3yV4lue')
      expect(entry.meta.req.query).toEqual({ token: FILTERED })
    }
  })

  it('leaves the referer, which can carry a token in its URL, out of the log', async () => {
    const entry = await logRequest('GET', '/places', {
      status: 200,
      headers: { referer: 'https://app.example.com/reset-password?token=k3yV4lue', accept: '*/*' },
    })

    expect(entry.meta.req.headers).toEqual({ accept: '*/*' })
  })
})
