import type Koa from 'koa'
import winston from 'winston'
import { redactBody, redactHeaders, redactUrl } from './redactForLog.js'

export interface RequestLoggerOptions {
  winstonInstance?: winston.Logger
  transports?: winston.transport[]
  format?: winston.Logform.Format
  // headers left out of the log (whole name, ignoring case)
  headerBlocklist?: string[]
  // body, query-string, header and route-parameter values masked in the log (any key, header or
  // route-parameter name containing a listed name, ignoring case, at any depth; also the referer's
  // query string; see redactForLog.ts)
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
    // A query-string parameter, request-body field, header or route parameter whose name contains
    // a `bodyBlocklist` name, ignoring case, such as `token` from `SENSITIVE_FIELDS` in
    // conf/app.ts (`?token=…`, `{ resetToken: … }`, `x-auth-token`, `:token`, `:tokenId`), is
    // logged as `[FILTERED]`, so a request to `/password-resets/:token` logs
    // `/password-resets/[FILTERED]`. A header whose whole name is in `headerBlocklist`, such as
    // `authorization` or `cookie`, is left out of the log instead. Under any other name a token is
    // logged as sent. These paths are logged as received, with only their query string masked: a
    // path that matches no route (a 404), a request with a method its route does not take (a 405,
    // or an `OPTIONS` request) and the path in a `referer` header. For a link such as an emailed
    // sign-in or reset link, the URL fragment (`/reset-password#token=…`), which browsers never
    // send to the server, not even in a `referer`, is still the safest place for the token; have
    // the page's JavaScript pass it on under a masked name.
    const url = redactUrl(ctx.url, bodyBlocklist, ctx.params)
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
