// Redaction for the request log written by requestLogger.ts.
//
// A value is masked when its key contains any blocklisted name, ignoring case, at any
// depth of the body, in the query string and in the request headers. With the default
// `bodyBlocklist`, `password`, `passwordConfirmation`, `accessToken`, `user[token]` and an
// `x-auth-token` header are all masked, and so is a harmless name like `tokenCount`. The key
// is kept, so the log still shows the field was sent. In the logged URL's path, the value of
// a route parameter whose name contains a blocklisted name, such as `:token` or `:tokenId`, is
// masked the same way, in the segment the matched route binds it to. A path with no route
// parameters, such as one that matches no route, is logged as received. The `referer` header
// keeps its URL with the same query-string masking as the logged request URL, and its path is
// logged as received.
//
// Objects and arrays nested more than MAX_LOGGED_DEPTH levels deep are replaced with
// TRUNCATED, so a deeply nested body cannot overflow the stack while it is being logged.
//
// This file deliberately has no dependencies.

export const FILTERED = '[FILTERED]'
export const TRUNCATED = '[TRUNCATED]'
export const MAX_LOGGED_DEPTH = 10

// returns a redacted copy of a parsed request body; the body itself is never modified
export function redactBody(body: unknown, blocklist: string[]): unknown {
  return redactValue(body, lowercase(blocklist), 1)
}

// masks the values of blocklisted query-string parameters, so
// `/v1/session?token=abc&page=2` becomes `/v1/session?token=[FILTERED]&page=2`; given the
// route parameters the router bound (`ctx.params`) and the path of the route it matched
// (`ctx.routerPath`), it also masks the path segments that hold a blocklisted one, so
// `/v1/api-tokens/42/usages/7` matched by `/v1/api-tokens/:apiTokenId/usages/:id` becomes
// `/v1/api-tokens/[FILTERED]/usages/7`
export function redactUrl(
  url: string,
  blocklist: string[],
  routeParams?: unknown,
  routePath?: unknown,
): string {
  const lowerBlocklist = lowercase(blocklist)
  return redactQuery(redactPath(url, routeParams, routePath, lowerBlocklist), lowerBlocklist)
}

// returns a copy of the request headers for the log: a header whose whole name, ignoring
// case, is in `headerBlocklist` is left out; any other header whose name contains a
// `bodyBlocklist` name is masked and keeps its key (`x-auth-token`, `proxy-authorization`);
// and the `referer` is logged with its query string masked as redactUrl does
export function redactHeaders(
  headers: Record<string, unknown>,
  headerBlocklist: string[],
  bodyBlocklist: string[],
): Record<string, unknown> {
  const leftOut = lowercase(headerBlocklist)
  const lowerBlocklist = lowercase(bodyBlocklist)

  return Object.fromEntries(
    Object.entries(headers)
      .filter(([name]) => !leftOut.includes(name.toLowerCase()))
      .map(([name, value]): [string, unknown] => [name, redactHeaderValue(name, value, lowerBlocklist)]),
  )
}

function redactHeaderValue(name: string, value: unknown, lowerBlocklist: string[]): unknown {
  if (isSensitive(name, lowerBlocklist)) return FILTERED
  if (name.toLowerCase() === 'referer' && typeof value === 'string') return redactQuery(value, lowerBlocklist)
  return value
}

function redactQuery(url: string, lowerBlocklist: string[]): string {
  const queryStart = url.indexOf('?')
  if (queryStart === -1) return url

  const query = url
    .slice(queryStart + 1)
    .split('&')
    .map(param => {
      const separator = param.indexOf('=')
      if (separator === -1) return param

      const key = param.slice(0, separator)
      return isSensitive(decodeQueryKey(key), lowerBlocklist) ? `${key}=${FILTERED}` : param
    })
    .join('&')

  return `${url.slice(0, queryStart)}?${query}`
}

// A blocklisted route parameter masks the segments the matched route binds it to, so a `tokenId`
// of `1` in `/v1/api-tokens/1/scopes/12`, matched by `/v1/api-tokens/:tokenId/scopes/:id`, masks
// only its own segment, and one bound inside a segment (`confirm-:token`) masks that whole
// segment. When the route does not line up with the path segment by segment (a splat such as
// `*path`, an optional `{…}` group, two parameters in one segment, a path that splits differently,
// such as an absolute URL, or no route at all), or the value is not in a segment the route binds
// it to, the value masks every segment that equals or contains it instead, decoded or as written,
// even one that holds it by chance (`v1` for a `tokenId` of `1`), and every segment a value
// spanning several, such as a splat's, overlaps. A value not found in the path at all masks every
// segment.
function redactPath(url: string, routeParams: unknown, routePath: unknown, lowerBlocklist: string[]): string {
  const params = sensitiveParams(routeParams, lowerBlocklist)
  if (params.length === 0) return url

  const queryStart = url.indexOf('?')
  const pathEnd = queryStart === -1 ? url.length : queryStart
  const segments = url.slice(0, pathEnd).split('/')
  const decoded = segments.map(segment => decodeOrKeep(segment, segment))
  const routeNames = routeParamNames(routePath, segments)

  const masked = new Set<number>()
  for (const [name, value] of params) {
    const bound = routeNames.flatMap((routeName, index) => (routeName === name ? [index] : []))
    let holding = bound.some(index => segments[index]?.includes(value) || decoded[index]?.includes(value))
      ? bound
      : [...segmentsOverlapping(value, segments), ...segmentsOverlapping(value, decoded)]
    if (holding.length === 0) holding = segments.flatMap((segment, index) => (segment === '' ? [] : [index]))
    for (const index of holding) masked.add(index)
  }

  const path = segments.map((segment, index) => (masked.has(index) ? FILTERED : segment)).join('/')
  return path + url.slice(pathEnd)
}

function sensitiveParams(routeParams: unknown, lowerBlocklist: string[]): [string, string][] {
  if (typeof routeParams !== 'object' || routeParams === null) return []

  const params: [string, string][] = []
  for (const [name, value] of Object.entries(routeParams) as [string, unknown][]) {
    if (typeof value !== 'string' || value === '' || !isSensitive(name, lowerBlocklist)) continue
    params.push([name, value])
  }
  return params
}

// the name of the parameter in each segment of the matched route's path, or no names at all when
// those segments do not line up one to one with the logged path's: the route path is not a string,
// uses route syntax other than `:name` (`*`, `{`, `\`, a quoted name and the like), or has two
// parameters in a segment, or the two paths split into different numbers of segments (the logged
// path may add one empty segment, after a trailing slash)
function routeParamNames(routePath: unknown, pathSegments: string[]): (string | undefined)[] {
  if (typeof routePath !== 'string' || /[*?+!(){}[\]\\"]/.test(routePath)) return []

  const routeSegments = routePath.split('/')
  const trailingSlash = pathSegments.length === routeSegments.length + 1 && pathSegments.at(-1) === ''
  if (pathSegments[0] !== '' || routeSegments[0] !== '') return []
  if (pathSegments.length !== routeSegments.length && !trailingSlash) return []
  if (routeSegments.some(segment => segment.indexOf(':') !== segment.lastIndexOf(':'))) return []

  return routeSegments.map(segment => /:([\w$]+)/.exec(segment)?.[1])
}

// the indexes of the segments that any occurrence of `value` in `segments.join('/')` overlaps
function segmentsOverlapping(value: string, segments: string[]): number[] {
  const path = segments.join('/')
  const starts: number[] = []
  for (let at = path.indexOf(value); at !== -1; at = path.indexOf(value, at + 1)) starts.push(at)

  const overlapping: number[] = []
  let next = 0
  let segmentStart = 0
  segments.forEach((segment, index) => {
    const segmentEnd = segmentStart + segment.length
    // an occurrence that ends before this segment starts overlaps no later segment either
    while ((starts[next] ?? Infinity) + value.length <= segmentStart) next++
    if ((starts[next] ?? Infinity) < segmentEnd) overlapping.push(index)
    segmentStart = segmentEnd + 1
  })
  return overlapping
}

function redactValue(value: unknown, lowerBlocklist: string[], depth: number): unknown {
  if (typeof value !== 'object' || value === null) return value
  if (depth > MAX_LOGGED_DEPTH) return TRUNCATED

  if (Array.isArray(value)) return value.map(item => redactValue(item, lowerBlocklist, depth + 1))

  // Object.fromEntries keeps a `__proto__` key from a JSON body as an ordinary key
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]): [string, unknown] => [
      key,
      isSensitive(key, lowerBlocklist) ? FILTERED : redactValue(nested, lowerBlocklist, depth + 1),
    ]),
  )
}

function isSensitive(key: string, lowerBlocklist: string[]): boolean {
  const lowerKey = key.toLowerCase()
  return lowerBlocklist.some(name => lowerKey.includes(name))
}

function lowercase(names: string[]): string[] {
  return names.map(name => name.toLowerCase())
}

function decodeQueryKey(key: string): string {
  return decodeOrKeep(key.replace(/\+/g, ' '), key)
}

// a malformed percent-escape is matched as written
function decodeOrKeep(text: string, asWritten: string): string {
  try {
    return decodeURIComponent(text)
  } catch (error) {
    if (error instanceof URIError) return asWritten
    throw error
  }
}
