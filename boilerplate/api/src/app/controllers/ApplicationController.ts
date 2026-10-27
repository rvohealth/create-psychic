import { PsychicController } from '@rvoh/psychic'
import { PsychicOpenapiNames } from '@rvoh/psychic/openapi'
import psychicTypes from '#src/types/psychic.js'
import { supportedLocales } from '#src/utils/i18n.js'

export default class ApplicationController extends PsychicController {
  public override get psychicTypes() {
    return psychicTypes
  }

  public static override get openapiNames(): PsychicOpenapiNames<ApplicationController> {
    return ['default', 'mobile', 'tests']
  }

  // The supported locale (src/utils/i18n.ts) the request's Accept-Language
  // header prefers, else the first supported locale. Koa does the negotiation
  // (its accepts and negotiator packages), weighing q-values and matching a bare
  // 'es' to 'es-ES', so a Koa update, not an edit here, brings its fixes
  protected get locale() {
    const locales = supportedLocales()
    return (this.ctx.acceptsLanguages(...locales) || locales[0]) as (typeof locales)[number]
  }
}
