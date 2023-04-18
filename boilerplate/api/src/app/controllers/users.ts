import { HowlController, Params } from 'howl'
import User from 'app/models/user'

export default class UsersController extends HowlController {
  public async create() {
    const user = await User.create(this.userParams)
    await this.startSession(user)
    this.ok(user)
  }

  public async login() {
    if (!this.params.email || !this.params.password) this.notFound()

    const user = await User.findOne({ where: { email: this.params.email } })
    if (!user || !await user.checkPassword(this.params.password))
      this.notFound()

    await this.startSession(user)
    this.ok()
  }

  public async logout() {
    this.endSession()
    this.ok()
  }

  public async me() {
    if (!this.user) return this.unauthorized()
    const user = this.user as User

    this.ok({
      id: user.id,
      email: user.email,
    })
  }


  private get userParams() {
    return Params.restrict(this.params?.user, ['email', 'password'])
  }
}
