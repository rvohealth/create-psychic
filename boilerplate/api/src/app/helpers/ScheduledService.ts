import { BaseScheduledService } from '@rvoh/psychic-workers'
import psychicTypes from '../../types/psychic.js'

export default class ScheduledService extends BaseScheduledService {
  public override get psychicTypes() {
    return psychicTypes
  }
}
