import { PsychicController, BeforeAction } from '@rvohealth/psychic'

export default class AuthedController extends PsychicController {
  // protected currentUser: User
  @BeforeAction()
  public async authenticate() {
    throw `TODO: Implement authentication scheme!`
    // implement an authentication pattern that ends with you setting
    // this.currentUser to a user. i.e.
    //
    // const token = this.req.headers['token']
    // const userId = await Encrypt.decode(token)
    // this.currentUser = await User.find(userId)
    //
  }
}
