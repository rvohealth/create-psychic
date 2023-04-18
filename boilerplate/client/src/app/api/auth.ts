import routes from '../config/routes'
import { api } from './common'

export default class AuthAPI {
  static signup(email: string, password: string) {
    return api.post(routes.api.signup, { user: { email, password } })
  }

  static logout() {
    return api.post(routes.api.logout)
  }

  static login(email: string, password: string) {
    return api.post(routes.api.login, { email, password })
  }

  static me() {
    return api.get(routes.api.me)
  }
}
