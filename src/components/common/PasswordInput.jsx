import { useState } from 'react'
import NavIcon from './NavIcon'

// <input type="password"> with a show/hide eye toggle — shared by every
// login form. Forwards id/autoComplete/className etc. like a plain input.
function PasswordInput({ className = '', ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={`pr-10 ${className}`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-faint hover:text-body"
      >
        <NavIcon name={visible ? 'eyeOff' : 'eye'} className="h-4 w-4" />
      </button>
    </div>
  )
}

export default PasswordInput
