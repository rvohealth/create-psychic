import locales from '#conf/locales/index.js'
import { I18nProvider } from '@rvoh/psychic/system'

// The request language tags the app accepts. ApplicationController's locale
// getter picks the one a request's Accept-Language header prefers. Each is
// served by its language's locale file ('en-US' by 'en'), and the first is the
// default. An app with a database enum of locales returns that enum's values
// here instead (Dream's src/types/db.ts exports them, as in LocalesEnumValues)
const SUPPORTED_LOCALES = ['en-US'] as const
export function supportedLocales() {
  return SUPPORTED_LOCALES
}

// The base locale. i18n falls back to it for a key the requested locale is
// missing, and a spec that passes it to I18nProvider.localeDifferences, such
// as spec/unit/conf/locales.spec.ts, checks every other locale against it
export const BASE_LOCALE = 'en'

export default I18nProvider.provide(locales, BASE_LOCALE)
