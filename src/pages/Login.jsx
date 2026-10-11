import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import { AuthLayout, PasswordField } from '../components/layout/AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const from = useLocation().state?.from || '/'
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  if (isLoggedIn) return <Navigate to={from} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email')
    if (f.password.length < 6) return setErr('Password must be at least 6 characters')
    setBusy(true); setErr('')
    try { await login(f.email.trim(), f.password); navigate(from, { replace: true }) }
    catch (e2) { setErr(e2.message); setBusy(false) }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Login to track your orders and leave reviews.">
      <Seo title="Login" description="Login to your TimeNest account." path="/login" />
      <form className="form" onSubmit={submit} noValidate>
        <label>Email
          <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" placeholder="you@example.com" />
        </label>
        <PasswordField label="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" />
        {err && <p className="notice error" role="alert">{err}</p>}
        <button className="btn btn-gold block" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
      </form>
      <p className="auth-switch muted">New to TimeNest? <Link to="/signup" state={{ from }} className="text-link">Create an account</Link></p>
    </AuthLayout>
  )
}
