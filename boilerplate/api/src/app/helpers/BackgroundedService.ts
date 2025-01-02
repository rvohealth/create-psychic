import { BaseBackgroundedService } from '@rvohealth/psychic'
import psychicTypes from '../../types/psychic'

export default class BackgroundedService extends BaseBackgroundedService {
  public get psychicTypes() {
    return psychicTypes
  }
}
