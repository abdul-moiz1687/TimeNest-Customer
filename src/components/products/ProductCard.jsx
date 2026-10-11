import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBagShopping } from '@fortawesome/free-solid-svg-icons'
import { productPath } from '../../services/productApi'
import { formatPrice } from '../../utils/format'
import { useCart } from '../../context/CartContext'
import Stars from '../Stars'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const soldOut = product.stock === 0
  return (
    <article className="p-card">
      <Link to={productPath(product)} className="p-img">
        {product.image ? <img src={product.image} alt={product.name} loading="lazy" /> : <div className="p-img-empty">No image</div>}
        {soldOut && <span className="sold">Sold out</span>}
      </Link>
      <div className="p-body">
        <p className="p-cat">{product.category}</p>
        <h3><Link to={productPath(product)}>{product.name}</Link></h3>
        {product.numReviews > 0 && (
          <div className="p-rating"><Stars value={product.averageRating} /> <span className="muted small">({product.numReviews})</span></div>
        )}
        <div className="p-foot">
          <strong>{formatPrice(product.price)}</strong>
          <button className="icon-btn add" disabled={soldOut} onClick={() => addItem(product)} aria-label={`Add ${product.name} to cart`}>
            <FontAwesomeIcon icon={faBagShopping} />
          </button>
        </div>
      </div>
    </article>
  )
}
