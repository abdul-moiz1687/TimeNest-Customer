import { Link, useLocation } from 'react-router-dom'
import Seo from '../components/Seo'
import { formatPrice, getOrderNumber, getOrderTotal } from '../utils/format'

export default function OrderSuccess() {
  const order = useLocation().state?.order
  return (
    <main className="container page narrow center">
      <Seo title="Order Placed" description="Your TimeNest order has been placed." path="/order-success" />
      {order ? (
        <>
          <h1>Thank you for your order</h1>
          <div className="summary">
            <div className="sum-row"><span>Order number</span><strong>{getOrderNumber(order)}</strong></div>
            <div className="sum-row"><span>Total</span><strong>{formatPrice(getOrderTotal(order))}</strong></div>
            <div className="sum-row"><span>Status</span><strong className="cap">{order.status || 'Pending'}</strong></div>
            <div className="sum-row"><span>Payment</span><strong>Cash on Delivery</strong></div>
          </div>
        </>
      ) : (
        <h1>Order details unavailable</h1>
      )}
      <div className="row-gap">
        <Link to="/my-orders" className="btn btn-gold">My Orders</Link>
        <Link to="/shop" className="btn btn-ghost">Continue shopping</Link>
      </div>
    </main>
  )
}
