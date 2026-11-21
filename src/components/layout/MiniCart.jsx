import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/format'
import { optimizeImage } from '../../services/productApi'

// Slides in after "Add to cart" so the visitor can check out without leaving the page
export default function MiniCart() {
  const { items, subtotal, count, drawerOpen, closeDrawer, setQuantity, removeItem } = useCart()

  useEffect(() => {
    if (!drawerOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && closeDrawer()
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [drawerOpen, closeDrawer])

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div className="mc-overlay" onClick={closeDrawer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            className="mc" role="dialog" aria-label="Your cart"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mc-top">
              <h3>Your cart <span className="muted small">({count})</span></h3>
              <button className="icon-btn" onClick={closeDrawer} aria-label="Close cart"><FontAwesomeIcon icon={faXmark} /></button>
            </div>

            {items.length === 0 ? (
              <div className="mc-empty"><p className="muted">Your cart is empty.</p><Link to="/shop" className="btn btn-gold" onClick={closeDrawer}>Browse the shop</Link></div>
            ) : (
              <>
                <ul className="mc-list">
                  {items.map((i) => (
                    <li key={i.id}>
                      <Link to={`/product/${i.slug || i.id}`} className="mc-img" onClick={closeDrawer}>{i.image && <img src={optimizeImage(i.image, 160)} alt={i.name} />}</Link>
                      <div className="mc-info">
                        <strong>{i.name}</strong>
                        <span className="muted small">{formatPrice(i.price)}</span>
                        <div className="qty">
                          <button onClick={() => setQuantity(i.id, i.quantity - 1)} aria-label="Decrease">−</button>
                          <span>{i.quantity}</span>
                          <button onClick={() => setQuantity(i.id, i.quantity + 1)} aria-label="Increase">+</button>
                        </div>
                      </div>
                      <div className="mc-side">
                        <strong>{formatPrice(i.price * i.quantity)}</strong>
                        <button className="link-btn small" onClick={() => removeItem(i.id)}>Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mc-foot">
                  <div className="sum-row"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
                  <p className="muted small">The final total is confirmed when you place the order. Payment: Cash on Delivery.</p>
                  <Link to="/checkout" className="btn btn-gold block" onClick={closeDrawer}>Checkout</Link>
                  <Link to="/cart" className="btn btn-ghost block" onClick={closeDrawer}>View cart</Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
