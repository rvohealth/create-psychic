const baseUrl = () => process.env.REACT_APP_HOWL_ENV === 'test' ?
  'http://localhost:7778' :
  'http://localhost:7777'

const routes = {
  baseURL: baseUrl(),

  app: {
    home: '/',
    login: '/login',
    logout: '/logout',
    signup: '/signup',
  },

  api: {
    me: '/me',
    login: '/login',
    logout: '/logout',
    signup: '/users',
  },
}

export default routes

