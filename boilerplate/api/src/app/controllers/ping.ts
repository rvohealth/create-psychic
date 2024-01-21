import { PsychicController } from '@rvohealth/psychic'

export default class PingController extends PsychicController {
  public ping() {
    this.ok({ hello: 'world' })
  }
}
