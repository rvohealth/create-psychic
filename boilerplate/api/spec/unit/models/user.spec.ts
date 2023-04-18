import User from 'app/models/user'
import { Hash } from 'howl'

describe ('User', () => {
  describe ('upon save', () => {
    it ('hashes password', async () => {
      const user = await User.create({ email: 'fish@wish', password: 'johnson' })
      expect(await Hash.check('johnson', user.passwordDigest)).toBe(true)
    })
  })

  describe ('check password', () => {
    let user: User

    beforeEach(async () => {
      user = await User.create({ email: 'fish@wish', password: 'johnson' })
    })

    it ('returns true with valid password', async () => {
      expect(await user.checkPassword('johnson')).toBe(true)
    })

    it ('returns false with invalid password', async () => {
      expect(await user.checkPassword('invalid')).toBe(false)
    })
  })
})
