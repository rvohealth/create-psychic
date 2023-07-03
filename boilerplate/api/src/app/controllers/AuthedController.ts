import { PsychicController, BeforeAction } from 'psychic'

export default class AuthedController extends PsychicController {
  @BeforeAction()
  public async authenticate() {
    throw `TODO: Implement authentication scheme!`
  }
}
