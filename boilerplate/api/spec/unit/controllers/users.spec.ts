import UsersController from 'app/controllers/users'
import mockRequest from './helpers/mockRequest'
import User from 'app/models/user'
import { HowlServer, NotFound } from 'howl'

describe ('UsersController', () => {
  const makeController = (params: { [key: string]: any }) => {
    const { req, res } = mockRequest(params)
    const server = new HowlServer()
    return new UsersController(req, res, { config: server.config })
  }

  describe ('#create', () => {
    it ('persists a new user to the database', async () => {
      const controller = makeController({
        body: {
          user: {
            email: 'fred@fred.fred',
            password: 'Superduper1010!',
          },
        },
      })

      await controller.create()
      const user = await User.last()
      expect(user.email).toEqual('fred@fred.fred')
    })
  })

  describe ('#login', () => {
    let user: User

    beforeEach(async () => {
      user = await User.create({ email: 'fred@fred.fred', password: 'Superduper1010!' })
    })

    it ('sets a cookie with the user id', async () => {
      const controller = makeController({
        body: {
          email: 'fred@fred.fred',
          password: 'Superduper1010!',
        },
      })

      jest.spyOn(controller.session, 'cookie')
      await controller.login()

      expect(controller.session.cookie).toHaveBeenCalledWith('auth_session', { id: user.id, modelKey: 'user' })
    })

    describe ('when the user does not exist', () => {
      it ('does not set a cookie', async () => {
        const controller = makeController({
          body: {
            email: 'notfred@notfred.notfred',
            password: 'Superduper1010!',
          },
        })

        jest.spyOn(controller.session, 'cookie')
        expect(async () => {
          await controller.login()
        }).rejects.toThrowError(NotFound)

        expect(controller.session.cookie).not.toHaveBeenCalled()
      })
    })

    describe ('when the password is invalid', () => {
      it ('does not set a cookie', async () => {
        const controller = makeController({
          body: {
            email: 'fred@fred.fred',
            password: 'NotSuperduper1010!',
          },
        })

        jest.spyOn(controller.session, 'cookie')
        expect(async () => {
          await controller.login()
        }).rejects.toThrowError(NotFound)

        expect(controller.session.cookie).not.toHaveBeenCalled()
      })
    })
  })

  describe ('#me', () => {
    let user: User

    beforeEach(async () => {
      user = await User.create({ email: 'fred@fred.fred', password: 'Superduper1010!' })
    })

    it ('returns the authenticated user', async () => {
      const controller = makeController({})

      jest.spyOn(controller.res, 'json')

      controller.user = user
      await controller.me()

      expect(controller.res.json).toHaveBeenCalledWith({
        id: user.id,
        email: user.email,
      })
    })

    describe ('when the authenticated user does not exist', () => {
      it ('returns unauthorized', async () => {
        const controller = makeController({})
        jest.spyOn(controller, 'unauthorized').mockImplementation(() => {})
        await controller.me()
        expect(controller.unauthorized).toHaveBeenCalledWith()
      })
    })
  })
})
