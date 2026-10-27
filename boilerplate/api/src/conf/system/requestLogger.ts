import type Koa from 'koa'
import winston from 'winston'
import { redactBody, redactHeaders, redactUrl } from './redactForLog.js'

export interface RequestLoggerOptions {
  winstonInstance?: winston.Logger
  transports?: winston.transport[]
  format?: winston.Logform.Format
  // headers left out of the log (whole name, ignoring case)
  headerBlocklist?: string[]
  // body, query-string and header values masked in the log (any key or header name containing
  // a listed name, ignoring case, at any depth; also the referer's query string; see redactForLog.ts)
  bodyBlocklist?: string[]
  ignoredRoutes?: string[]
}

export default function requestLogger(options: RequestLoggerOptions = {}): Koa.Middleware {
  const {
    winstonInstance,
    transports,
    format,
    headerBlocklist = [],
    bodyBlocklist = [],
    ignoredRoutes = [],
  } = options

  const logger =
    winstonInstance ??
    winston.createLogger({
      transports: transports ?? [new winston.transports.Console()],
      format: format ?? winston.format.json(),
    })

  const ignoredSet = new Set(ignoredRoutes)

  return async (ctx: Koa.Context, next: Koa.Next) => {
    if (ignoredSet.has(ctx.path)) {
      await next()
      return
    }

    const start = Date.now()
    await next()
    const duration = Date.now() - start

    const status = ctx.status
    // Only the query string is masked here. The path is logged exactly as received, and so is the
    // path in a `referer` header, so a route must never carry a secret in a path segment (such as
    // `/password-resets/:token`). Send a token in the query string, a request-body field or a
    // header, under a name the logger masks: one containing a `bodyBlocklist` name, ignoring case,
    // such as `token` from `SENSITIVE_FIELDS` in conf/app.ts (`?token=…`, `{ resetToken: … }`,
    // `x-auth-token`). A header whose whole name is in `headerBlocklist`, such as `authorization`
    // or `cookie`, is left out of the log instead. Under any other name a token is logged as sent.
    // For a link such as an emailed sign-in or reset link, put the token in the URL fragment
    // (`/reset-password#token=…`), which browsers never send to the server, not even in a
    // `referer`, and have the page's JavaScript pass it on the same way, under a masked name.
    const url = redactUrl(ctx.url, bodyBlocklist)
    const message = `${ctx.method} ${url} ${status} ${duration}ms`

    let level: string
    if (status >= 500) level = 'error'
    else if (status >= 400) level = 'warn'
    else level = 'info'

    const logEntry: Record<string, unknown> = { message, level }
    const headers = redactHeaders(ctx.headers, headerBlocklist, bodyBlocklist)
    const body = redactBody(ctx.request.body, bodyBlocklist)

    logEntry.meta = {
      req: {
        method: ctx.method,
        url,
        headers,
        body,
      },
      res: {
        statusCode: status,
      },
      responseTime: duration,
    }

    logger.log(logEntry as winston.LogEntry)
  }
}
