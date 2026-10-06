// Redaction for the request log written by requestLogger.ts.
//
// A value is masked when its key contains any blocklisted name, ignoring case, at any
// depth of the body and in the query string. With the default `bodyBlocklist`, `password`,
// `passwordConfirmation`, `accessToken` and `user[token]` are all masked, and so is a
// harmless name like `tokenCount`. The key is kept, so the log still shows the field was sent.
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
// `/v1/session?token=abc&page=2` becomes `/v1/session?token=[FILTERED]&page=2`
export function redactUrl(url: string, blocklist: string[]): string {
  const queryStart = url.indexOf('?')
  if (queryStart === -1) return url

  const lowerBlocklist = lowercase(blocklist)
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
  try {
    return decodeURIComponent(key.replace(/\+/g, ' '))
  } catch (error) {
    // a malformed percent-escape is matched as written
    if (error instanceof URIError) return key
    throw error
  }
}
