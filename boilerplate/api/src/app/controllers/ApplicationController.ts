import { PsychicController, PsychicOpenapiControllerConfig } from '@rvohealth/psychic'
import psychicTypes from '../../types/psychic'

export default class ApplicationController extends PsychicController {
  public get psychicTypes() {
    return psychicTypes
  }

  public static get openapiConfig(): PsychicOpenapiControllerConfig<ApplicationController> {
    return { names: ['default', 'mobile'] }
  }
}
