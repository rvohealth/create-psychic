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

    // The third argument is what @koa/router leaves in `ctx.params`: each route parameter's
    // value, percent-decoded, or as written when it holds a malformed percent-escape.
    describe('given the route parameters', () => {
      it('masks the path segment bound to a parameter whose name contains a listed name', () => {
        expect(redactUrl('/password-resets/k3yV4lue', blocklist, { token: 'k3yV4lue' })).toBe(
          `/password-resets/${FILTERED}`,
        )
        expect(
          redactUrl('/v1/guests/9/invitations/inv-s3cret?page=2', blocklist, {
            guestId: '9',
            invitationToken: 'inv-s3cret',
          }),
        ).toBe(`/v1/guests/9/invitations/${FILTERED}?page=2`)
      })

      it('masks a parameter named like `tokenId`, and matches names ignoring case', () => {
        expect(redactUrl('/v1/api-tokens/12/scopes', blocklist, { tokenId: '12' })).toBe(
          `/v1/api-tokens/${FILTERED}/scopes`,
        )
        expect(redactUrl('/v1/resets/abc', blocklist, { ResetTOKEN: 'abc' })).toBe(`/v1/resets/${FILTERED}`)
      })

      it('leaves the values of the other parameters as sent', () => {
        expect(redactUrl('/v1/places/42/bookings/7', blocklist, { placeId: '42', id: '7' })).toBe(
          '/v1/places/42/bookings/7',
        )
      })

      it('still masks the query string by name, and only there', () => {
        expect(redactUrl('/v1/places/42?token=q&page=2', blocklist, { placeId: '42' })).toBe(
          `/v1/places/42?token=${FILTERED}&page=2`,
        )
        expect(redactUrl('/password-resets/abc?token=abc&next=/abc', blocklist, { token: 'abc' })).toBe(
          `/password-resets/${FILTERED}?token=${FILTERED}&next=/abc`,
        )
      })

      it('masks a value the router decoded from a percent-encoded segment', () => {
        expect(redactUrl('/password-resets/abc%20123', blocklist, { token: 'abc 123' })).toBe(
          `/password-resets/${FILTERED}`,
        )
        expect(
          redactUrl('/v1/guests/9/invitations/s%2Fx', blocklist, { guestId: '9', invitationToken: 's/x' }),
        ).toBe(`/v1/guests/9/invitations/${FILTERED}`)
      })

      it('masks a value the router kept as written, because of a malformed percent-escape, without throwing', () => {
        expect(redactUrl('/password-resets/%E0%A4%A', blocklist, { token: '%E0%A4%A' })).toBe(
          `/password-resets/${FILTERED}`,
        )
      })

      it('masks every segment equal to the value', () => {
        expect(redactUrl('/tokens/abc/confirm/abc', blocklist, { token: 'abc' })).toBe(
          `/tokens/${FILTERED}/confirm/${FILTERED}`,
        )
      })

      // `/tokens/:id/confirm-:token` binds both `id` and `token` to `abc` for `/tokens/abc/confirm-abc`
      it('also masks a segment that contains the value when another segment equals it', () => {
        expect(redactUrl('/tokens/abc/confirm-abc', blocklist, { id: 'abc', token: 'abc' })).toBe(
          `/tokens/${FILTERED}/${FILTERED}`,
        )
      })

      // fails closed: without the route it cannot tell where the router bound the value, so `v1`
      // and `12` are masked too
      it('without the matched route, masks every segment that contains the value, even one that holds it by chance', () => {
        expect(redactUrl('/v1/api-tokens/1/scopes/12', blocklist, { tokenId: '1', id: '12' })).toBe(
          `/${FILTERED}/api-tokens/${FILTERED}/scopes/${FILTERED}`,
        )
      })

      // `/files/*secretPath/edit` binds `secretPath` to `a/b c` for `/files/a/b%20c/edit`, and
      // `/files/pre-*secretPath` binds it to `a/b` for `/files/pre-a/b`
      it('masks every segment a splat value spans', () => {
        expect(redactUrl('/files/a/b%20c/edit?page=2', blocklist, { secretPath: 'a/b c' })).toBe(
          `/files/${FILTERED}/${FILTERED}/edit?page=2`,
        )
        expect(redactUrl('/files/pre-a/b', blocklist, { secretPath: 'a/b' })).toBe(
          `/files/${FILTERED}/${FILTERED}`,
        )
      })

      // `/v/:a-:tokenPart` binds `tokenPart` to `s3cret` for `/v/x-s3cret`
      it('masks the whole segment when the value is only part of one', () => {
        expect(redactUrl('/v/x-s3cret', blocklist, { a: 'x', tokenPart: 's3cret' })).toBe(`/v/${FILTERED}`)
        expect(redactUrl('/v/x-s%33cret', blocklist, { a: 'x', tokenPart: 's3cret' })).toBe(`/v/${FILTERED}`)
      })

      // `/v/:tokenPart-:b` binds `tokenPart` to `Abc` for `/v/%41bc-%E0%A4%A`, but the segment as a
      // whole does not decode
      it('masks every segment when it cannot find the value in the path', () => {
        expect(redactUrl('/v/%41bc-%E0%A4%A?page=2', blocklist, { tokenPart: 'Abc', b: '%E0%A4%A' })).toBe(
          `/${FILTERED}/${FILTERED}?page=2`,
        )
      })

      // a path that matches no route (a 404) or a method its route does not take (a 405 or OPTIONS)
      it('leaves the path as sent when no route parameters were bound', () => {
        expect(redactUrl('/password-reset/k3yV4lue?token=q', blocklist, undefined)).toBe(
          `/password-reset/k3yV4lue?token=${FILTERED}`,
        )
        expect(redactUrl('/password-resets/k3yV4lue', blocklist, {})).toBe('/password-resets/k3yV4lue')
        expect(redactUrl('/password-resets/k3yV4lue', blocklist, null)).toBe('/password-resets/k3yV4lue')
        expect(redactUrl('/password-resets/k3yV4lue', blocklist, 'k3yV4lue')).toBe('/password-resets/k3yV4lue')
      })

      // an optional parameter the request leaves out is bound as undefined
      it('ignores a listed-name parameter without a string value', () => {
        expect(redactUrl('/files', blocklist, { token: undefined })).toBe('/files')
        expect(redactUrl('/files/1', blocklist, { token: 1, secret: '' })).toBe('/files/1')
      })

      it('does not modify the route parameters', () => {
        const params = deepFreeze({ token: 'abc', id: '1' })

        expect(redactUrl('/x/1/abc', blocklist, params)).toBe(`/x/1/${FILTERED}`)
        expect(params).toEqual({ token: 'abc', id: '1' })
      })

      // The fourth argument is what @koa/router leaves in `ctx.routerPath`: the path of the route it
      // matched, such as `/v1/api-tokens/:apiTokenId/usages/:id` for psychic's
      // `r.namespace('v1', r => r.resources('api-tokens', r => r.resources('usages')))`.
      describe('and the route the router matched', () => {
        it('masks only the segment the route binds a listed-name parameter to', () => {
          expect(
            redactUrl(
              '/v1/api-tokens/42/usages/1420',
              blocklist,
              { apiTokenId: '42', id: '1420' },
              '/v1/api-tokens/:apiTokenId/usages/:id',
            ),
          ).toBe(`/v1/api-tokens/${FILTERED}/usages/1420`)
          expect(
            redactUrl(
              '/v1/api-tokens/1/scopes/12',
              blocklist,
              { tokenId: '1', id: '12' },
              '/v1/api-tokens/:tokenId/scopes/:id',
            ),
          ).toBe(`/v1/api-tokens/${FILTERED}/scopes/12`)
        })

        it('lines up a path with a trailing slash, and still masks the query string by name', () => {
          expect(
            redactUrl(
              '/v1/api-tokens/1/usages/1420/?token=q&page=2',
              blocklist,
              { apiTokenId: '1', id: '1420' },
              '/v1/api-tokens/:apiTokenId/usages/:id',
            ),
          ).toBe(`/v1/api-tokens/${FILTERED}/usages/1420/?token=${FILTERED}&page=2`)
        })

        it('masks a percent-encoded or malformed segment the route binds a listed-name parameter to', () => {
          expect(
            redactUrl(
              '/v1/guests/9/invitations/s%2Fx',
              blocklist,
              { guestId: '9', invitationToken: 's/x' },
              '/v1/guests/:guestId/invitations/:invitationToken',
            ),
          ).toBe(`/v1/guests/9/invitations/${FILTERED}`)
          expect(
            redactUrl('/password-resets/%E0%A4%A', blocklist, { token: '%E0%A4%A' }, '/password-resets/:token'),
          ).toBe(`/password-resets/${FILTERED}`)
        })

        // `abc` in the second segment is bound to `:id`, which is not a listed name
        it('masks the whole segment when the parameter is only part of it', () => {
          expect(
            redactUrl('/tokens/7/confirm-s3cret', blocklist, { id: '7', token: 's3cret' }, '/tokens/:id/confirm-:token'),
          ).toBe(`/tokens/7/${FILTERED}`)
          expect(
            redactUrl('/tokens/abc/confirm-abc', blocklist, { id: 'abc', token: 'abc' }, '/tokens/:id/confirm-:token'),
          ).toBe(`/tokens/abc/${FILTERED}`)
        })

        it('masks every segment the route binds a repeated listed-name parameter to', () => {
          expect(redactUrl('/t/a/b/c', blocklist, { token: 'c' }, '/t/:token/b/:token')).toBe(
            `/t/${FILTERED}/b/${FILTERED}`,
          )
        })

        // the route cannot say which segment holds the value, so each segment that contains it is masked
        it('falls back to masking every segment that contains the value for a splat, an optional group or two parameters in one segment', () => {
          expect(
            redactUrl('/files/a/b%20c/edit?page=2', blocklist, { secretPath: 'a/b c' }, '/files/*secretPath/edit'),
          ).toBe(`/files/${FILTERED}/${FILTERED}/edit?page=2`)
          expect(
            redactUrl('/opt/12/s3cret12', blocklist, { id: '12', tokenPart: 's3cret12' }, '/opt/:id{/:tokenPart}'),
          ).toBe(`/opt/12/${FILTERED}`)
          expect(redactUrl('/v1/v/1-1', blocklist, { a: '1', tokenPart: '1' }, '/v1/v/:a-:tokenPart')).toBe(
            `/${FILTERED}/v/${FILTERED}`,
          )
          expect(redactUrl('/v/x-s3cret', blocklist, { a: 'x', tokenPart: 's3cret' }, '/v/:a-:tokenPart')).toBe(
            `/v/${FILTERED}`,
          )
        })

        it('falls back to masking every segment that contains the value when the path does not split like the route', () => {
          // an absolute-form request target
          expect(
            redactUrl(
              'http://example.test/password-resets/k3yV4lue',
              blocklist,
              { token: 'k3yV4lue' },
              '/password-resets/:token',
            ),
          ).toBe(`http://example.test/password-resets/${FILTERED}`)
          // a route a `router.use()` prefix matched, with more segments after it
          expect(
            redactUrl('/v1/api-tokens/1/scopes/12', blocklist, { tokenId: '1', id: '12' }, '/v1/api-tokens/:tokenId'),
          ).toBe(`/${FILTERED}/api-tokens/${FILTERED}/scopes/${FILTERED}`)
        })

        // Koa routes `/a\k3yV4lue#/` as `/a/k3yV4lue`, so the route's `:token` lines up with the
        // logged path's empty last segment, not with the one that holds the value
        it('falls back to masking every segment that contains the value when it is not in the segment the route binds it to', () => {
          expect(redactUrl('/a\\k3yV4lue#/', blocklist, { x: 'a', token: 'k3yV4lue' }, '/:x/:token')).toBe(
            `/${FILTERED}/`,
          )
          expect(redactUrl('/a\\k3yV4lue/#', blocklist, { x: 'a', token: 'k3yV4lue' }, '/:x/:token')).toBe(
            `/${FILTERED}/#`,
          )
          // a listed-name parameter the route does not name, such as one an earlier layer bound
          expect(redactUrl('/password-resets/k3yV4lue', blocklist, { token: 'k3yV4lue' }, '/password-resets/:id')).toBe(
            `/password-resets/${FILTERED}`,
          )
        })

        it('falls back to masking every segment that contains the value when the route is not a string', () => {
          expect(
            redactUrl('/v1/api-tokens/1/scopes/12', blocklist, { tokenId: '1', id: '12' }, /^\/v1\/api-tokens\/(\d+)/),
          ).toBe(`/${FILTERED}/api-tokens/${FILTERED}/scopes/${FILTERED}`)
          expect(redactUrl('/v1/api-tokens/1/scopes/12', blocklist, { tokenId: '1', id: '12' }, undefined)).toBe(
            `/${FILTERED}/api-tokens/${FILTERED}/scopes/${FILTERED}`,
          )
        })

        it('leaves the path as sent when no listed-name parameter was bound', () => {
          expect(redactUrl('/v1/places/42/bookings/7', blocklist, { placeId: '42', id: '7' }, '/v1/places/:placeId/bookings/:id')).toBe(
            '/v1/places/42/bookings/7',
          )
          expect(redactUrl('/password-resets/k3yV4lue', blocklist, undefined, '/password-resets/:token')).toBe(
            '/password-resets/k3yV4lue',
          )
        })
      })
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
      expect(source).toContain('redactUrl(ctx.url, bodyBlocklist, ctx.params, ctx.routerPath)')
      expect(source.match(/ctx\.(?:request\.)?headers?\b/g)).toHaveLength(1)
      expect(source.match(/ctx\.request\.body/g)).toHaveLength(1)
      expect(source.match(/ctx\.url/g)).toHaveLength(1)
      expect(source.match(/ctx\.params/g)).toHaveLength(1)
      expect(source.match(/ctx\.routerPath/g)).toHaveLength(1)
    })

    it('stays free of imports, so this suite can load it without winston or koa', () => {
      expect(readBoilerplateFile('src', 'conf', 'system', 'redactForLog.ts')).not.toMatch(/^\s*import\b/m)
    })
  })
})
