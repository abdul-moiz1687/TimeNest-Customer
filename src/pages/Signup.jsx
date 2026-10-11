import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import { AuthLayout, PasswordField } from '../components/layout/AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const from = useLocation().state?.from || '/'
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  if (isLoggedIn) return <Navigate to={from} replace />
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    if (f.name.trim().length < 2) return setErr('Enter your name')
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email')
    if (f.password.length < 6) return setErr('Password must be at least 6 characters')
    if (f.password !== f.confirm) return setErr('Passwords do not match')
    setBusy(true); setErr('')
    try { await signup(f.name.trim(), f.email.trim(), f.password); navigate(from, { replace: true }) }
    catch (e2) { setErr(e2.message); setBusy(false) }
  }

  return (
    <AuthLayout title="Create your account" subtitle="One account to order, track and review your clocks.">
      <Seo title="Create Account" description="Create your TimeNest account to order and review." path="/signup" />
      <form className="form" onSubmit={submit} noValidate>
        <label>Full name<input value={f.name} onChange={set('name')} autoComplete="name" /></label>
        <label>Email<input type="email" value={f.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" /></label>
        <PasswordField label="Password" value={f.password} onChange={set('password')} autoComplete="new-password" />
        <PasswordField label="Confirm password" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" />
        {err && <p className="notice error" role="alert">{err}</p>}
        <button className="btn btn-gold block" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="auth-switch muted">Already registered? <Link to="/login" state={{ from }} className="text-link">Login</Link></p>
    </AuthLayout>
  )
}
