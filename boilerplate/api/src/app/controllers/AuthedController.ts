import { BeforeAction } from '@rvoh/psychic'
import ApplicationController from './ApplicationController.js'
// import User from '../models/User.js'

export default class AuthedController extends ApplicationController {
  // protected currentUser: User

  @BeforeAction()
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async authenticate() {
    throw new Error(`TODO: Implement authentication scheme!`)
    // implement an authentication pattern that ends with you setting
    // this.currentUser to a user. i.e.:

    // const userId = this.getCookie('token')
    // const user = await User.find(userId)
    // if (!user) return this.unauthorized()

    // this.currentUser = user
  }
}
