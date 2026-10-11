import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'

export default function Cart() {
  const { items, subtotal, setQuantity, removeItem } = useCart()
  return (
    <main className="container page">
      <Seo title="Your Cart" description="Review the items in your TimeNest cart." path="/cart" />
      <h1>Your cart</h1>
      {items.length === 0 ? (
        <div className="empty"><p>Your cart is empty.</p><Link to="/shop" className="btn btn-gold">Continue shopping</Link></div>
      ) : (
        <div className="cart-layout">
          <ul className="cart-list">
            {items.map((i) => (
              <li key={i.id}>
                <Link to={`/product/${i.slug || i.id}`} className="cart-img">{i.image && <img src={i.image} alt={i.name} />}</Link>
                <div className="cart-info">
                  <Link to={`/product/${i.slug || i.id}`}><h3>{i.name}</h3></Link>
                  <p className="muted">{formatPrice(i.price)}</p>
                  <div className="qty">
                    <button onClick={() => setQuantity(i.id, i.quantity - 1)} aria-label="Decrease">−</button>
                    <span>{i.quantity}</span>
                    <button onClick={() => setQuantity(i.id, i.quantity + 1)} aria-label="Increase">+</button>
                  </div>
                </div>
                <div className="cart-side">
                  <strong>{formatPrice(i.price * i.quantity)}</strong>
                  <button className="link-btn" onClick={() => removeItem(i.id)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <aside className="summary">
            <h3>Summary</h3>
            <div className="sum-row"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
            <p className="muted small">The final total is confirmed by the store when you place the order.</p>
            <Link to="/checkout" className="btn btn-gold block">Checkout</Link>
          </aside>
        </div>
      )}
    </main>
  )
}
