import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { placeOrder } from '../services/orderApi'
import { formatPrice } from '../utils/format'

const phoneOk = (p) => /^(03\d{9}|\+923\d{9})$/.test(p.replace(/[\s-]/g, ''))
const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e)

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ customerName: user?.name || '', phone: '', email: user?.email || '', address: '', city: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  if (items.length === 0)
    return <main className="container page"><div className="empty"><p>Your cart is empty.</p><Link to="/shop" className="btn btn-gold">Continue shopping</Link></div></main>

  const validate = () => {
    const e = {}
    if (form.customerName.trim().length < 2) e.customerName = 'Enter your full name'
    if (!phoneOk(form.phone)) e.phone = 'Enter a valid number, e.g. 03001234567'
    if (!emailOk(form.email)) e.email = 'Enter a valid email'
    if (form.address.trim().length < 8) e.address = 'Enter your full address'
    if (form.city.trim().length < 2) e.city = 'Enter your city'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (busy || !validate()) return
    setBusy(true); setServerError('')
    try {
      const order = await placeOrder(token, { ...form, phone: form.phone.replace(/[\s-]/g, '') }, items)
      clearCart()
      navigate('/order-success', { replace: true, state: { order } })
    } catch (err) {
      setServerError(err.message)
      setBusy(false)
    }
  }

  const field = (k, label, type = 'text') => (
    <label>{label}
      <input type={type} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} />
      {errors[k] && <span className="field-error">{errors[k]}</span>}
    </label>
  )

  return (
    <main className="container page">
      <Seo title="Checkout" description="Complete your TimeNest order with Cash on Delivery." path="/checkout" />
      <h1>Checkout</h1>
      <div className="cart-layout">
        <form className="form" onSubmit={submit} noValidate>
          {field('customerName', 'Full name')}
          {field('phone', 'Phone', 'tel')}
          {field('email', 'Email', 'email')}
          {field('address', 'Address')}
          {field('city', 'City')}
          <div className="pay-box"><strong>Payment method</strong><p>Cash on Delivery (COD)</p></div>
          {serverError && <p className="notice error">{serverError}</p>}
          <button className="btn btn-gold" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
        </form>
        <aside className="summary">
          <h3>Order summary</h3>
          {items.map((i) => (
            <div className="sum-row" key={i.id}><span>{i.name} × {i.quantity}</span><span>{formatPrice(i.price * i.quantity)}</span></div>
          ))}
          <div className="sum-row total"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
          <p className="muted small">The final total is confirmed by the store when the order is placed.</p>
        </aside>
      </div>
    </main>
  )
}
