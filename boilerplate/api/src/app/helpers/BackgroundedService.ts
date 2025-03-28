import { BaseBackgroundedService } from '@rvoh/psychic-workers'
import psychicTypes from '../../types/psychic.js'

export default class BackgroundedService extends BaseBackgroundedService {
  public override get psychicTypes() {
    return psychicTypes
  }
}
