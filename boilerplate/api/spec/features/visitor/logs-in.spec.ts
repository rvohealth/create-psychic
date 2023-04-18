import User from 'app/models/user'
import { visit } from '../helpers/puppeteer'

describe ('a visitor logs in', () => {
  beforeEach(async () => {
    await User.create({ email: 'fred@fred.fred', password: 'Superduper1010!' })
    await visit('login')
  })

  it ('should log in user and redirect to dash', async () => {
    await expect(page).toMatch('Login')
    await expect(page).toFillForm('#login-form', {
      email: 'fred@fred.fred',
      password: 'Superduper1010!',
    })
    await expect(page).toClick('button', { text: 'submit' })
    await expect(page).toHaveUrl('/')
    await expect(page).toMatch('DASH')
  })

  describe ('when a user does not provide valid credentials', () => {
    it ('should log in user and redirect to dash', async () => {
      await expect(page).toMatch('Login')
      await expect(page).toFillForm('#login-form', {
        email: 'fred@fred.fred',
        password: 'badpassword',
      })
      await expect(page).toClick('button', { text: 'submit' })
      await expect(page).toMatch('Invalid credentials')
    })
  })
})

