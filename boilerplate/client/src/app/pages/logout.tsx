import React, { useEffect } from 'react'
import AuthAPI from '../api/auth'
import routes from '../config/routes'

export default function LogoutPage() {
  useEffect(() => {
    async function signout() {
      await AuthAPI.logout()
      window.location.href = routes.app.login
    }
    signout()
  }, [])

  return null
}
