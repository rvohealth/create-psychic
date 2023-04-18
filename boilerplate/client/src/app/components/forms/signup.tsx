import React, { useState } from 'react'
import FormGroup from './form-group'
import AuthAPI from '../../api/auth'
import routes from '../../config/routes'
import {AxiosError} from 'axios'
import {HowlHttpError} from '../../api/common'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [emailErrors, setEmailErrors] = useState<string[]>([])
  const [password, setPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  return (
    <form
      id='signup-form'
      onSubmit={ async event => {
        event.preventDefault()
        try {
          await AuthAPI.signup(email, password)
          window.location.href = routes.app.home
        } catch (err) {
          const errors = (err as HowlHttpError).response.data.errors
          errors.forEach((error: { field: string, messages: string[] }) => {
            if (error.field === 'email')
              setEmailErrors(error.messages)

            if (error.field === 'password')
              setPasswordErrors(error.messages)
          })

          if (errors.password)
            setEmailErrors(errors.password)
        }
      }}
    >
      <FormGroup
        id="email"
        value={email}
        errors={emailErrors}
        onChange={setEmail}
      />
      <FormGroup
        id="password"
        inputType="password"
        value={password}
        errors={passwordErrors}
        onChange={setPassword}
      />
      <button>submit</button>
    </form>
  )
}
