import { HowlRouter } from 'howl'

export default (r: HowlRouter) => {
  r.post('login', 'users#login')
  r.post('logout', 'users#logout')
  r.get('me', 'users#me')
  r.resources('users', { only: ['create', 'index'] })
}
