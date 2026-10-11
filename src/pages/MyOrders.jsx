import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../services/orderApi'
import { formatDate, formatPrice, getOrderNumber, getOrderTotal } from '../utils/format'

export default function MyOrders() {
  const { token, logout } = useAuth()
  const [state, setState] = useState({ loading: true, error: '', orders: [] })

  useEffect(() => {
    let alive = true
    getMyOrders(token)
      .then((orders) => alive && setState({ loading: false, error: '', orders }))
      .catch((e) => {
        if (!alive) return
        if (/token|unauthor|expired/i.test(e.message)) logout()
        setState({ loading: false, error: e.message, orders: [] })
      })
    return () => { alive = false }
  }, [token, logout])

  return (
    <main className="container page narrow">
      <Seo title="My Orders" description="View your TimeNest orders and their status." path="/my-orders" />
      <h1>My orders</h1>
      {state.loading && <div className="skeleton detail-skel" />}
      {state.error && <p className="notice error">{state.error}</p>}
      {!state.loading && !state.error && state.orders.length === 0 && (
        <div className="empty"><p>You have not placed any orders yet.</p><Link to="/shop" className="btn btn-gold">Start shopping</Link></div>
      )}
      <ul className="orders">
        {state.orders.map((o) => (
          <li key={o._id}>
            <div className="order-top">
              <div><strong>Order {getOrderNumber(o)}</strong><p className="muted small">{formatDate(o.createdAt)}</p></div>
              <span className={`status ${String(o.status || '').toLowerCase()}`}>{o.status || 'Pending'}</span>
            </div>
            <ul className="order-items">
              {(o.items || o.orderItems || []).map((i, idx) => (
                <li key={idx}><span>{i.product?.name || i.name || 'Product'}</span><span>× {i.quantity}</span></li>
              ))}
            </ul>
            <div className="sum-row total"><span>Total</span><strong>{formatPrice(getOrderTotal(o))}</strong></div>
          </li>
        ))}
      </ul>
    </main>
  )
}
