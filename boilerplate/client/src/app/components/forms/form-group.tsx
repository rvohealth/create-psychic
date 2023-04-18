import React from 'react'

export default function FormGroup({
  id,
  value,
  onChange,
  label,
  errors=[],
  required=false,
  inputType='text',
  name=undefined,
  step=undefined,
}: {
  id: string
  value: string
  onChange: (str: string) => void
  label?: string
  errors?: string[]
  required?: boolean
  inputType?: string
  name?: string
  step?: number
}) {
  return (
    <React.Fragment>
      <div className="form-group">
        <label htmlFor={id}>{label || name || id}</label>
        <input
          id={id}
          type={inputType}
          value={value}
          name={name || label || id}
          onChange={e => onChange(e.target.value)}
          required={required}
          step={step}
        />
      </div>
      <div className='errors'>
        { errors.map((err, index) =>
          <div className='error' key={index}>{err}</div>
        ) }
      </div>
    </React.Fragment>
  )
}

