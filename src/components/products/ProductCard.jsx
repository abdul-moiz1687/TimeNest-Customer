import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faPlus } from '@fortawesome/free-solid-svg-icons'
import { imageSrcSet, optimizeImage, productPath } from '../../services/productApi'
import { formatPrice } from '../../utils/format'
import { useCart } from '../../context/CartContext'
import Stars from '../Stars'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const soldOut = product.stock === 0

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1600)
    return () => clearTimeout(t)
  }, [added])

  const add = () => { addItem(product); setAdded(true) }

  return (
    <article className="pc">
      <div className="pc-media">
        <Link to={productPath(product)} aria-label={product.name}>
          {product.image ? (
            <img
              src={optimizeImage(product.image, 600)}
              srcSet={imageSrcSet(product.image)}
              sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
              alt={product.name}
              loading="lazy"
              decoding="async"
            />
          ) : <div className="p-img-empty">No image</div>}
        </Link>
        {soldOut && <span className="pc-tag">Sold out</span>}
        <button className={`pc-quick ${added ? 'done' : ''}`} disabled={soldOut} onClick={add} aria-label={`Add ${product.name} to cart`}>
          <FontAwesomeIcon icon={added ? faCheck : faPlus} />
          <span>{added ? 'Added' : 'Add to cart'}</span>
        </button>
      </div>
      <div className="pc-body">
        <p className="pc-cat">{String(product.category).replace(' Wall Clocks', '')}</p>
        <h3><Link to={productPath(product)}>{product.name}</Link></h3>
        <div className="pc-meta">
          <strong>{formatPrice(product.price)}</strong>
          {product.numReviews > 0 && <span className="pc-rating"><Stars value={product.averageRating} size="0.75rem" /> <small>({product.numReviews})</small></span>}
        </div>
      </div>
    </article>
  )
}
