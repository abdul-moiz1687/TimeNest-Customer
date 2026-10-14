import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import Stars from '../components/Stars'
import ReviewSection from '../components/reviews/ReviewSection'
import { getProduct, optimizeImage } from '../services/productApi'
import { getReviews } from '../services/reviewApi'
import { useCart } from '../context/CartContext'
import { formatPrice, SITE_URL } from '../utils/format'
import NotFound from './NotFound'

export default function ProductDetails() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('loading')
  const [reviews, setReviews] = useState(null)
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let alive = true
    setStatus('loading'); setActive(0); setQty(1)
    getProduct(slug)
      .then((p) => { if (alive) { setProduct(p); setStatus('ok') } })
      .catch(() => alive && setStatus('error'))
    return () => { alive = false }
  }, [slug])

  const loadReviews = useCallback((id) => {
    getReviews(id).then(setReviews).catch(() => setReviews({ reviews: [], total: 0, average: 0 }))
  }, [])

  useEffect(() => { if (product?.id) loadReviews(product.id) }, [product?.id, loadReviews])

  if (status === 'loading') return <main className="container page"><div className="skeleton detail-skel" /></main>
  if (status === 'error' || !product) return <NotFound />

  const soldOut = product.stock === 0
  const path = `/product/${product.slug || product.id}`
  const hasReviews = reviews?.total > 0
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'Product',
      name: product.name, description: product.description, image: product.images, category: product.category,
      offers: {
        '@type': 'Offer', priceCurrency: 'PKR', price: product.price, url: `${SITE_URL}${path}`,
        ...(product.stock != null && { availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' }),
      },
      ...(hasReviews && { aggregateRating: { '@type': 'AggregateRating', ratingValue: reviews.average.toFixed(1), reviewCount: reviews.total } }),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
        { '@type': 'ListItem', position: 3, name: product.name },
      ],
    },
  ]

  const add = () => { addItem(product, qty); setAdded(true); setTimeout(() => setAdded(false), 1800) }

  return (
    <main className="container page">
      <Seo title={product.name} description={(product.description || `${product.name} by TimeNest`).slice(0, 155)} path={path} image={product.image} type="product" jsonLd={ld} />
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.name}</span></nav>

      <div className="detail">
        <div className="gallery">
          <div className="gallery-main">
            {product.images[active] ? <img src={optimizeImage(product.images[active], 1100)} alt={product.name} decoding="async" fetchPriority="high" /> : <div className="p-img-empty">No image</div>}
          </div>
          {product.images.length > 1 && (
            <div className="thumbs">
              {product.images.map((src, i) => (
                <button key={src} className={i === active ? 'active' : ''} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`}>
                  <img src={optimizeImage(src, 160)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="info">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          {hasReviews && <a href="#reviews" className="rating-line"><Stars value={reviews.average} /> <span className="muted small">{reviews.average.toFixed(1)} ({reviews.total})</span></a>}
          <p className="price">{formatPrice(product.price)}</p>
          {product.stock != null && (
            <p className={soldOut ? 'stock out' : 'stock'}>
              {soldOut ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
            </p>
          )}
          {product.description && <p className="desc">{product.description}</p>}
          {product.features.length > 0 && (
            <ul className="features">{product.features.map((f) => <li key={f}>{f}</li>)}</ul>
          )}
          <div className="buy">
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock ?? 99, qty + 1))} aria-label="Increase">+</button>
            </div>
            <button className="btn btn-gold" disabled={soldOut} onClick={add}>{added ? 'Added ✓' : 'Add to cart'}</button>
          </div>
          <p className="muted small">Payment: Cash on Delivery</p>
        </div>
      </div>

      <ReviewSection productId={product.id} data={reviews} onSubmitted={() => loadReviews(product.id)} />
    </main>
  )
}
