import ApplicationController from '#controllers/ApplicationController.js'
import { supportedLocales } from '#src/utils/i18n.js'
import Koa from 'koa'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { expectTypeOf } from 'vitest'

// No new app ships this spec. create-psychic's pnpm no-client generation spec
// copies it into the app it generates, after changing that app's
// supportedLocales() to ['en-US', 'es-ES'], and runs it with the app's uspec,
// because create-psychic itself installs neither Psychic nor Koa

class LocaleProbe extends ApplicationController {
  public get requestLocale() {
    return this.locale
  }
}

// a real Koa context, as the router hands a controller, for a request that
// sends this Accept-Language header (none when undefined)
function localeFor(acceptLanguage: string | undefined) {
  const req = new IncomingMessage(new Socket())
  if (acceptLanguage !== undefined) req.headers['accept-language'] = acceptLanguage
  const ctx = new Koa().createContext(req, new ServerResponse(req))
  return new LocaleProbe(ctx, { action: 'show' }).requestLocale
}

describe('ApplicationController#locale', () => {
  it('runs against the two supported locales the generation spec wrote', () => {
    expect(supportedLocales()).toEqual(['en-US', 'es-ES'])
  })

  it.each([
    // a browser asking for Spanish (Spain), then any Spanish
    ['es-ES,es;q=0.9', 'es-ES'],
    // a bare language matches a supported tag of that language
    ['es', 'es-ES'],
    // Chrome adds the bare language after a region the app does not list
    ['es-MX,es;q=0.9', 'es-ES'],
    // an unsupported first choice gives way to the next acceptable one
    ['fr;q=1, es;q=0.5', 'es-ES'],
    // matching ignores case, and the getter returns the list's own spelling
    ['ES-es', 'es-ES'],
    // quality values rank the languages, not their order
    ['es-ES;q=0.5,en-US;q=0.9', 'en-US'],
    // any language: the first supported locale
    ['*', 'en-US'],
    // q=0 rules a language out
    ['es;q=0', 'en-US'],
    // nothing supported is acceptable: the first supported locale
    ['fr', 'en-US'],
    // a sibling region alone is not a match
    ['es-MX', 'en-US'],
  ])('given Accept-Language %j, is %s', (acceptLanguage, expected) => {
    expect(localeFor(acceptLanguage)).toEqual(expected)
  })

  it('is the first supported locale when the request sends no Accept-Language header', () => {
    expect(localeFor(undefined)).toEqual('en-US')
  })

  it('is typed as one of the supported locales', () => {
    expectTypeOf(localeFor('es')).toEqualTypeOf<'en-US' | 'es-ES'>()
  })
})
