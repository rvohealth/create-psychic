import { PsychicController, BeforeAction } from 'psychic'

export default class AdminAuthedController extends PsychicController {
  @BeforeAction()
  public async authenticate() {
    throw `TODO: Implement admin authentication scheme!`
  }
}
