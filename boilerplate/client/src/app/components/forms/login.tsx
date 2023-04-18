import React, { useState } from 'react'
import FormGroup from './form-group'
import AuthAPI from '../../api/auth'
import routes from '../../config/routes'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  return (
    <form
      id='login-form'
      onSubmit={ async event => {
        event.preventDefault()
        try {
          await AuthAPI.login(email, password)
          window.location.href = routes.app.home
        } catch (err) {
          setError(true)
        }
      }}
    >
      { error && <div className='error'>Invalid credentials</div> }

      <FormGroup
        id="email"
        value={email}
        onChange={ val => {
          setEmail(val)
          setError(false)
        }}
      />
      <FormGroup
        id="password"
        inputType="password"
        value={password}
        onChange={ val => {
          setPassword(val)
          setError(false)
        }}
      />
      <button>submit</button>
    </form>
  )
}

