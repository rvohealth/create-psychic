import { BaseScheduledService } from '@rvohealth/psychic'
import psychicTypes from '../../types/psychic'

export default class ScheduledService extends BaseScheduledService {
  public get psychicTypes() {
    return psychicTypes
  }
}
