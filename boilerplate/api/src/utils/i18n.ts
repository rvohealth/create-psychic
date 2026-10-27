import locales from '#conf/locales/index.js'
import { I18nProvider } from '@rvoh/psychic/system'

const SUPPORTED_LOCALES = ['en-US']
export function supportedLocales() {
  return SUPPORTED_LOCALES
}

// The base locale. i18n falls back to it for a key the requested locale is
// missing, and a spec that passes it to I18nProvider.localeDifferences, such
// as spec/unit/conf/locales.spec.ts, checks every other locale against it
export const BASE_LOCALE = 'en'

export default I18nProvider.provide(locales, BASE_LOCALE)
