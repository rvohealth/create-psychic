import { PsychicController, BeforeAction } from '@rvohealth/psychic'

export default class AuthedController extends PsychicController {
  @BeforeAction()
  public async authenticate() {
    throw `TODO: Implement authentication scheme!`
  }
}
