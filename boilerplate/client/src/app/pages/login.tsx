import React, { useState } from 'react'
import AuthAPI from '../api/auth'
import FormGroup from '../components/forms/form-group'
import routes from '../config/routes'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  return (
    <div className='page'>
      <h1>Login</h1>
      <form
        id='login-form'
        onSubmit={ async event => {
          event.preventDefault()
          try {
            await AuthAPI.login(email, password)
            window.location.href = routes.app.home
            // window.location.href = routes.app.dash

          } catch (err) {
            setError(true)
          }
        }}
      >
        { error && <div className='error'>Invalid credentials</div> }

        <FormGroup
          id="email"
          label="email"
          name="email"
          value={email}
          errors={[]}
          onChange={ val => {
            setEmail(val)
            setError(false)
          }}
        />
        <FormGroup
          id="password"
          label="password"
          name="password"
          inputType="password"
          value={password}
          errors={[]}
          onChange={ val => {
            setPassword(val)
            setError(false)
          }}
        />
        <button>submit</button>
      </form>
    </div>
  )
}
