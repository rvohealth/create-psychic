import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { setAuthedUser } from './app/stores/app'
import AuthAPI from './app/api/auth'
import routes from './app/config/routes'
import HomePage from './app/pages/home'
import LoginPage from './app/pages/login'
import SignupPage from './app/pages/signup'
import DashPage from './app/pages/dash'
import LogoutPage from './app/pages/logout'
import './app/styles/app.scss'

function App() {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(state => state.app.currentUser)

  useEffect(() => {
    const fetchAuthedUser = async () => {
      try {
        const res = await AuthAPI.me()
        dispatch(setAuthedUser(res.data))
      } catch (_) {
      }
    }
    fetchAuthedUser()
  }, [dispatch])

  return (
    <div id='app'>
      { currentUser && <AuthenticatedApp /> }
      { !currentUser && <UnauthenticatedApp /> }
    </div>
  )
}

function AuthenticatedApp() {
  return (
    <Routes>
      <Route path={routes.app.home} element={<DashPage />} />
      <Route path={routes.app.login} element={<Navigate to={routes.app.home} />} />
      <Route path={routes.app.logout} element={<LogoutPage />} />
      <Route path={routes.app.signup} element={<Navigate to={routes.app.home} />} />
    </Routes>
  )
}

function UnauthenticatedApp() {
  return (
    <Routes>
      <Route path={routes.app.home} element={<HomePage />} />
      <Route path={routes.app.login} element={<LoginPage />} />
      <Route path={routes.app.logout} element={<LogoutPage />} />
      <Route path={routes.app.signup} element={<SignupPage />} />
    </Routes>
  )
}

export default App
