import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  FILTERED,
  MAX_LOGGED_DEPTH,
  redactBody,
  redactHeaders,
  redactUrl,
  TRUNCATED,
} from '../../../boilerplate/api/src/conf/system/redactForLog.js'

function readBoilerplateFile(...segments: string[]): string {
  return readFileSync(join(process.cwd(), 'boilerplate', 'api', ...segments), 'utf8')
}

// The body blocklist the scaffold passes to requestLogger (`SENSITIVE_FIELDS` in conf/app.ts).
function scaffoldBodyBlocklist(): string[] {
  const list = readBoilerplateFile('src', 'conf', 'app.ts').match(
    /const SENSITIVE_FIELDS = \[([^\]]*)\]/,
  )?.[1]
  if (list === undefined) throw new Error('SENSITIVE_FIELDS not found in conf/app.ts')
  return [...list.matchAll(/'([^']*)'/g)].map(match => match[1] ?? '')
}

// The header blocklist the scaffold passes to requestLogger (`headerBlocklist` in conf/app.ts).
function scaffoldHeaderBlocklist(): string[] {
  const list = readBoilerplateFile('src', 'conf', 'app.ts').match(/headerBlocklist: \[([^\]]*)\]/)?.[1]
  if (list === undefined) throw new Error('headerBlocklist not found in conf/app.ts')
  return [...list.matchAll(/'([^']*)'/g)].map(match => match[1] ?? '')
}

// `levels` objects wrapped around `leaf`, built without recursion.
function nestedObjects(levels: number, leaf: unknown): unknown {
  let value = leaf
  for (let i = 0; i < levels; i++) value = { child: value }
  return value
}

// `levels` arrays wrapped around `leaf`, built without recursion.
function nestedArrays(levels: number, leaf: unknown): unknown {
  let value = leaf
  for (let i = 0; i < levels; i++) value = [value]
  return value
}

// How many objects/arrays deep a value nests (a primitive is 0), measured without recursion.
function nestingDepth(value: unknown): number {
  let deepest = 0
  const pending: [unknown, number][] = [[value, 1]]
  for (let next = pending.pop(); next; next = pending.pop()) {
    const [current, depth] = next
    if (typeof current !== 'object' || current === null) continue
    deepest = Math.max(deepest, depth)
    for (const child of Object.values(current)) pending.push([child, depth + 1])
  }
  return deepest
}

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    for (const child of Object.values(value)) deepFreeze(child)
    Object.freeze(value)
  }
  return value
}

// The scaffold's request logger runs these over every logged request. They are tested here,
// in create-psychic's own suite, because generated apps ship no spec for them.
describe('boilerplate/api/src/conf/system/redactForLog.ts', () => {
  const blocklist = scaffoldBodyBlocklist()

  it('is exercised with the scaffold body blocklist', () => {
    expect(blocklist).toEqual(['password', 'token', 'authentication', 'authorization', 'secret'])
  })

  describe('redactBody', () => {
    it('masks a top-level sensitive field and keeps its key', () => {
      expect(redactBody({ email: 'bear@example.com', password: 'hunter2' }, blocklist)).toEqual({
        email: 'bear@example.com',
        password: FILTERED,
      })
    })

    it('masks sensitive fields inside nested objects', () => {
      expect(
        redactBody({ user: { email: 'e', token: 't', profile: { secret: 's', name: 'n' } } }, blocklist),
      ).toEqual({ user: { email: 'e', token: FILTERED, profile: { secret: FILTERED, name: 'n' } } })
    })

    it('masks sensitive fields inside arrays and keeps arrays as arrays', () => {
      const redacted = redactBody([{ token: 't1', id: 1 }, { token: 't2', id: 2 }, 'plain', 3], blocklist)

      expect(Array.isArray(redacted)).toBe(true)
      expect(redacted).toEqual([{ token: FILTERED, id: 1 }, { token: FILTERED, id: 2 }, 'plain', 3])
      expect(redactBody({ guests: [{ password: 'p', tags: ['a', 'b'] }] }, blocklist)).toEqual({
        guests: [{ password: FILTERED, tags: ['a', 'b'] }],
      })
    })

    it('masks a field whose name contains a listed name, ignoring case', () => {
      expect(
        redactBody(
          {
            accessToken: 'a',
            passwordConfirmation: 'b',
            currentPassword: 'c',
            clientSecret: 'd',
            PASSWORD: 'e',
            Authorization: 'f',
            refresh_token: 'g',
            x_authentication_id: 'h',
            email: 'i',
          },
          blocklist,
        ),
      ).toEqual({
        accessToken: FILTERED,
        passwordConfirmation: FILTERED,
        currentPassword: FILTERED,
        clientSecret: FILTERED,
        PASSWORD: FILTERED,
        Authorization: FILTERED,
        refresh_token: FILTERED,
        x_authentication_id: FILTERED,
        email: 'i',
      })
    })

    it('also masks harmless fields that contain a listed name, keeping the key so the log shows it', () => {
      expect(redactBody({ tokenCount: 3, secretary: 'Ms. Bear' }, blocklist)).toEqual({
        tokenCount: FILTERED,
        secretary: FILTERED,
      })
    })

    it('masks the whole value of a sensitive field, even an object or an array', () => {
      expect(redactBody({ secret: { nested: 'x' }, tokens: ['a', 'b'] }, blocklist)).toEqual({
        secret: FILTERED,
        tokens: FILTERED,
      })
    })

    it('keeps non-sensitive values of every JSON type', () => {
      const body = { name: 'Bear', count: 2, ratio: 0.5, active: false, deletedAt: null, tags: [], meta: {} }
      expect(redactBody(body, blocklist)).toEqual(body)
    })

    it('returns a body that is not an object or array unchanged', () => {
      expect(redactBody(undefined, blocklist)).toBeUndefined()
      expect(redactBody(null, blocklist)).toBeNull()
      expect(redactBody('plain text', blocklist)).toBe('plain text')
      expect(redactBody(42, blocklist)).toBe(42)
    })

    it('does not modify the request body', () => {
      const body = deepFreeze({ password: 'p', user: { token: 't', roles: [{ secret: 's', name: 'n' }] } })
      const before = structuredClone(body)

      const redacted = redactBody(body, blocklist)

      expect(body).toEqual(before)
      expect(redacted).not.toBe(body)
      expect((redacted as { user: unknown }).user).not.toBe(body.user)
    })

    it('keeps an own `__proto__` key from a JSON body as data', () => {
      const redacted = redactBody(JSON.parse('{"__proto__": {"token": "t", "id": 1}}'), blocklist) as object

      expect(Object.getPrototypeOf(redacted)).toBe(Object.prototype)
      expect(Object.hasOwn(redacted, '__proto__')).toBe(true)
      expect(JSON.stringify(redacted)).toBe(`{"__proto__":{"token":"${FILTERED}","id":1}}`)
    })

    describe('depth cap', () => {
      it(`logs ${MAX_LOGGED_DEPTH} levels of nesting in full`, () => {
        const body = nestedObjects(MAX_LOGGED_DEPTH - 1, { token: 't', id: 1 })

        expect(nestingDepth(body)).toBe(MAX_LOGGED_DEPTH)
        expect(redactBody(body, blocklist)).toEqual(
          nestedObjects(MAX_LOGGED_DEPTH - 1, { token: FILTERED, id: 1 }),
        )
      })

      it('replaces an object or array nested any deeper with a marker', () => {
        expect(redactBody(nestedObjects(MAX_LOGGED_DEPTH, { id: 1 }), blocklist)).toEqual(
          nestedObjects(MAX_LOGGED_DEPTH, TRUNCATED),
        )
        expect(redactBody(nestedArrays(MAX_LOGGED_DEPTH, ['a']), blocklist)).toEqual(
          nestedArrays(MAX_LOGGED_DEPTH, TRUNCATED),
        )
      })

      it('drops sensitive values below the cap along with everything else there', () => {
        const redacted = JSON.stringify(
          redactBody(nestedObjects(MAX_LOGGED_DEPTH, { secret: 's3' }), blocklist),
        )

        expect(redacted).not.toContain('s3')
        expect(redacted).toContain(TRUNCATED)
      })

      // About 10 KB of nested arrays (under the scaffold's 20 KB jsonLimit) made winston's JSON
      // format throw RangeError before this cap, turning the request into a 500.
      it('caps a ~10 KB body of 5,000 nested arrays', () => {
        const body: unknown = JSON.parse('['.repeat(5_000) + '{"token":"t"}' + ']'.repeat(5_000))

        const redacted = redactBody(body, blocklist)

        expect(nestingDepth(redacted)).toBe(MAX_LOGGED_DEPTH)
        expect(redacted).toEqual(nestedArrays(MAX_LOGGED_DEPTH, TRUNCATED))
      })

      it('handles nesting far deeper than recursion could walk', () => {
        expect(redactBody(nestedArrays(200_000, { password: 'p' }), blocklist)).toEqual(
          nestedArrays(MAX_LOGGED_DEPTH, TRUNCATED),
        )
      })
    })
  })

  describe('redactUrl', () => {
    it('masks a sensitive query-string value and keeps the key', () => {
      expect(redactUrl('/v1/session?token=abc123&page=2', blocklist)).toBe(
        `/v1/session?token=${FILTERED}&page=2`,
      )
    })

    it('matches partial names and case, as the body does', () => {
      expect(redactUrl('/x?accessToken=a&Password=b&client_secret=c&q=d', blocklist)).toBe(
        `/x?accessToken=${FILTERED}&Password=${FILTERED}&client_secret=${FILTERED}&q=d`,
      )
    })

    it('matches bracketed and percent-encoded keys, logging each key as sent', () => {
      expect(redactUrl('/x?user[token]=a&user%5Bpassword%5D=b&t%6Fken=c', blocklist)).toBe(
        `/x?user[token]=${FILTERED}&user%5Bpassword%5D=${FILTERED}&t%6Fken=${FILTERED}`,
      )
    })

    it('masks every repeat of a key, and values that contain "="', () => {
      expect(redactUrl('/x?token=a&token=b%3D%3D&secret=c==', blocklist)).toBe(
        `/x?token=${FILTERED}&token=${FILTERED}&secret=${FILTERED}`,
      )
    })

    it('leaves every other parameter exactly as sent', () => {
      const url = '/places?q=bear%20cave&sort=-created_at&tags[]=a&tags[]=b&flag&&empty='
      expect(redactUrl(url, blocklist)).toBe(url)
    })

    it('leaves a URL without a query string unchanged', () => {
      expect(redactUrl('/v1/places/1', blocklist)).toBe('/v1/places/1')
      expect(redactUrl('/v1/places?', blocklist)).toBe('/v1/places?')
    })

    it('matches a key with a malformed percent-escape as written instead of throwing', () => {
      expect(redactUrl('/x?token%E0%A4%A=a&q%E0%A4%A=b', blocklist)).toBe(
        `/x?token%E0%A4%A=${FILTERED}&q%E0%A4%A=b`,
      )
    })
  })

  describe('redactHeaders', () => {
    const headerBlocklist = scaffoldHeaderBlocklist()

    it('is exercised with the scaffold header blocklist', () => {
      expect(headerBlocklist).toEqual([
        'authorization',
        'content-length',
        'connection',
        'cookie',
        'sec-ch-ua',
        'sec-ch-ua-mobile',
        'sec-ch-ua-platform',
        'sec-fetch-dest',
        'sec-fetch-mode',
        'sec-fetch-site',
        'user-agent',
      ])
    })

    it('masks a header whose name contains a listed name and keeps its key', () => {
      expect(
        redactHeaders(
          {
            host: 'api.example.com',
            accept: 'application/json',
            'x-auth-token': 'tok-header',
            'proxy-authorization': 'Basic cHJveHk6aHVudGVyMg==',
            'x-api-secret': 'sec-header',
            'x-csrf-token': 'csrf-header',
          },
          headerBlocklist,
          blocklist,
        ),
      ).toEqual({
        host: 'api.example.com',
        accept: 'application/json',
        'x-auth-token': FILTERED,
        'proxy-authorization': FILTERED,
        'x-api-secret': FILTERED,
        'x-csrf-token': FILTERED,
      })
    })

    it('matches header names ignoring case and masks a repeated header as a whole', () => {
      expect(
        redactHeaders({ 'X-Auth-Token': 't', 'X-Api-Secret': ['s1', 's2'] }, headerBlocklist, blocklist),
      ).toEqual({ 'X-Auth-Token': FILTERED, 'X-Api-Secret': FILTERED })
    })

    it('still leaves out a header whose whole name is in the header blocklist, ignoring case', () => {
      expect(
        redactHeaders(
          {
            authorization: 'Bearer tok-bearer',
            Cookie: 'session=s',
            'user-agent': 'curl/8.7.1',
            'content-length': '2',
            accept: '*/*',
          },
          headerBlocklist,
          blocklist,
        ),
      ).toEqual({ accept: '*/*' })
    })

    it('masks, instead of leaving out, a listed-name header that an app removes from the header blocklist', () => {
      expect(redactHeaders({ authorization: 'Bearer tok-bearer' }, [], blocklist)).toEqual({
        authorization: FILTERED,
      })
    })

    // the scaffold's header blocklist leaves out user-agent; an app that removes it logs it in full
    it('keeps a header that matches neither list exactly as sent', () => {
      const headers = {
        'user-agent': 'Mozilla/5.0',
        'accept-language': 'en-US',
        'x-forwarded-for': '203.0.113.7',
        'x-request-id': 'req-1',
      }
      expect(redactHeaders(headers, [], blocklist)).toEqual(headers)
    })

    it('masks sensitive query-string values in the referer, as in the logged URL', () => {
      expect(
        redactHeaders(
          { referer: 'https://app.example.com/reset-password?token=abc123&step=2' },
          headerBlocklist,
          blocklist,
        ),
      ).toEqual({ referer: `https://app.example.com/reset-password?token=${FILTERED}&step=2` })
      expect(
        redactHeaders({ Referer: 'https://app.example.com/x?accessToken=a&q=b' }, headerBlocklist, blocklist),
      ).toEqual({ Referer: `https://app.example.com/x?accessToken=${FILTERED}&q=b` })
    })

    it('leaves a referer without a sensitive query-string value as sent', () => {
      const headers = { referer: 'https://app.example.com/places?page=2&sort=name' }
      expect(redactHeaders(headers, headerBlocklist, blocklist)).toEqual(headers)
      expect(redactHeaders({ referer: 'https://app.example.com/' }, headerBlocklist, blocklist)).toEqual({
        referer: 'https://app.example.com/',
      })
    })

    it('does not modify the request headers', () => {
      const headers = deepFreeze({
        'x-auth-token': 't',
        cookie: 'c',
        referer: 'https://app.example.com/?token=t',
      })
      const before = structuredClone(headers)

      const redacted = redactHeaders(headers, headerBlocklist, blocklist)

      expect(headers).toEqual(before)
      expect(redacted).not.toBe(headers)
    })
  })

  describe('use by requestLogger.ts', () => {
    const requestLogger = () => readBoilerplateFile('src', 'conf', 'system', 'requestLogger.ts')

    it('logs the request headers, body and URL only through the redaction helpers', () => {
      const source = requestLogger()

      expect(source).toContain("import { redactBody, redactHeaders, redactUrl } from './redactForLog.js'")
      expect(source).toContain('redactHeaders(ctx.headers, headerBlocklist, bodyBlocklist)')
      expect(source).toContain('redactBody(ctx.request.body, bodyBlocklist)')
      expect(source).toContain('redactUrl(ctx.url, bodyBlocklist)')
      expect(source.match(/ctx\.(?:request\.)?headers?\b/g)).toHaveLength(1)
      expect(source.match(/ctx\.request\.body/g)).toHaveLength(1)
      expect(source.match(/ctx\.url/g)).toHaveLength(1)
    })

    it('stays free of imports, so this suite can load it without winston or koa', () => {
      expect(readBoilerplateFile('src', 'conf', 'system', 'redactForLog.ts')).not.toMatch(/^\s*import\b/m)
    })
  })
})
