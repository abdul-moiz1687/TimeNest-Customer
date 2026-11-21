import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getRecent } from '../../utils/recent'
import { formatPrice } from '../../utils/format'
import { optimizeImage } from '../../services/productApi'

// Read once when the page opens, so the product being viewed right now is not listed
export default function RecentlyViewed({ currentId }) {
  const [items] = useState(() => getRecent().filter((p) => p.id !== currentId).slice(0, 6))
  if (!items.length) return null
  return (
    <section className="related">
      <h2>Recently viewed</h2>
      <div className="rv-row">
        {items.map((p) => (
          <Link key={p.id} to={`/product/${p.slug || p.id}`} className="rv-card">
            <div className="rv-img">{p.image && <img src={optimizeImage(p.image, 300)} alt={p.name} loading="lazy" />}</div>
            <strong>{p.name}</strong>
            <span className="muted small">{formatPrice(p.price)}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
