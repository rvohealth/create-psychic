import User from 'app/models/user'
import { visit } from '../helpers/puppeteer'

describe ('a visitor signs up', () => {
  beforeEach(async () => {
    await visit('signup')
    await expect(page).toMatch('Signup')
  })

  it ('should create a user', async () => {
    await expect(page).toFillForm('#signup-form', {
      email: 'fred@fred.fred',
      password: 'Superduper1010!',
    })
    await expect(page).toClick('button', { text: 'submit' })
    await expect(page).toHaveUrl('/')
    await expect(page).toMatch('DASH')
    const user = await User.last()
    expect(user.email).toEqual('fred@fred.fred')
    expect(await user.checkPassword('Superduper1010!')).toEqual(true)
  })

  describe ('when a user does not provide a valid email', () => {
    it ('prevents account creation', async () => {
      await expect(page).toFillForm('#signup-form', {
        email: 'fred',
        password: 'password',
      })
      await expect(page).toClick('button', { text: 'submit' })
      await expect(page).toMatch('email failed')
      // await expect(page).toHaveUrl('signup')
      // expect(await User.count()).toEqual(0)
    })
  })
})
