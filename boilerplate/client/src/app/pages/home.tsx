import React from 'react'
import { NavLink } from 'react-router-dom'
import routes from '../config/routes'

export default function HomePage() {
  return (
    <div className='page'>
      <NavLink to={routes.app.login}>login</NavLink>
      <nav>
        <NavLink to={routes.app.login}>login</NavLink>
        <NavLink to={routes.app.signup}>signup</NavLink>
      </nav>
    </div>
  )
}
