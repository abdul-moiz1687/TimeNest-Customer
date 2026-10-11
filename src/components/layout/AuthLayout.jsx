import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import ClockArt from '../ClockArt'

export function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="auth">
      <aside className="auth-visual" aria-hidden="false">
        <Link to="/" className="logo">Time<span>Nest</span></Link>
        <ClockArt />
        <p className="auth-quote">A clock should be as considered as the room it hangs in.</p>
      </aside>
      <section className="auth-panel">
        <div className="auth-box">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  )
}

export function PasswordField({ label, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <label>{label}
      <span className="pw">
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
          <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
        </button>
      </span>
    </label>
  )
}
