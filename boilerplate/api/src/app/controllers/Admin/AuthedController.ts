import { PsychicController, BeforeAction } from '@rvohealth/psychic'

export default class AdminAuthedController extends PsychicController {
  @BeforeAction()
  public async authenticate() {
    throw `TODO: Implement admin authentication scheme!`
  }
}
