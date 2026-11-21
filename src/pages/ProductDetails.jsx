import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import Seo from '../components/Seo'
import RelatedProducts from '../components/products/RelatedProducts'
import RecentlyViewed from '../components/products/RecentlyViewed'
import { pushRecent } from '../utils/recent'
import { waLink as buildWaLink } from '../utils/whatsapp'
import Stars from '../components/Stars'
import ReviewSection from '../components/reviews/ReviewSection'
import { getProduct, optimizeImage } from '../services/productApi'
import { getReviews } from '../services/reviewApi'
import { useCart } from '../context/CartContext'
import { formatPrice, SITE_URL } from '../utils/format'
import NotFound from './NotFound'

const sameProduct = (p, slug) => !!p && (p.slug === slug || p.id === slug)

export default function ProductDetails() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const location = useLocation()
  const [fetched, setFetched] = useState(null)
  const [status, setStatus] = useState('loading')
  const [showBar, setShowBar] = useState(false)
  const buyRef = useRef(null)
  // The card the visitor clicked passes its data along, so the page can render instantly while the full product loads
  const seed = sameProduct(location.state?.product, slug) ? location.state.product : null
  const product = sameProduct(fetched, slug) ? fetched : seed
  const [reviews, setReviews] = useState(null)
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const zoomRef = useRef(null)

  useEffect(() => {
    let alive = true
    setStatus('loading'); setActive(0); setQty(1); setReviews(null)
    getProduct(slug)
      .then((p) => { if (alive) { setFetched(p); setStatus('ok') } })
      .catch(() => alive && setStatus('error'))
    return () => { alive = false }
  }, [slug])

  const loadReviews = useCallback((id) => {
    getReviews(id).then(setReviews).catch(() => setReviews({ reviews: [], total: 0, average: 0 }))
  }, [])

  useEffect(() => { if (product?.id) loadReviews(product.id) }, [product?.id, loadReviews])
  useEffect(() => { if (product?.id) pushRecent(product) }, [product])
  // Sticky "Add to cart" bar (mobile): shown once the main buy buttons have scrolled out of view
  useEffect(() => {
    const el = buyRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [product?.id])

  if (!product && status !== 'error') return <main className="container page"><div className="skeleton detail-skel" /></main>
  if (!product) return <NotFound />

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
  const onZoom = (e) => {
    const el = zoomRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--zx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
    el.style.setProperty('--zy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`)
  }
  const waLink = buildWaLink(`Hi TimeNest, I would like to order: ${product.name} (${formatPrice(product.price)})\n${window.location.href}`)

  return (
    <main className="container page">
      <Seo title={product.name} description={(product.description || `${product.name} by TimeNest`).slice(0, 155)} path={path} image={product.image} type="product" jsonLd={ld} />
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.name}</span></nav>

      <div className="detail">
        <div className="gallery">
          <div className="gallery-main" ref={zoomRef} onPointerMove={onZoom}>
            {product.images[active] ? <img src={optimizeImage(product.images[active], 1100)} alt={product.name} decoding="async" fetchPriority="high" style={{ viewTransitionName: `pimg-${product.id}` }} /> : <div className="p-img-empty">No image</div>}
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
          <div className="buy" ref={buyRef}>
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock ?? 99, qty + 1))} aria-label="Increase">+</button>
            </div>
            <button className="btn btn-gold" disabled={soldOut} onClick={add}>{added ? 'Added ✓' : 'Add to cart'}</button>
          </div>
          {waLink && (
            <a className="btn btn-wa" href={waLink} target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faWhatsapp} /> Order on WhatsApp
            </a>
          )}
          {!waLink && import.meta.env.DEV && (
            <p className="dev-hint">Dev note: the WhatsApp button is hidden because VITE_WHATSAPP_NUMBER is not set. Add it to .env.local, then restart npm run dev.</p>
          )}
          <p className="muted small">Payment: Cash on Delivery</p>
        </div>
      </div>

      <ReviewSection productId={product.id} data={reviews} onSubmitted={() => loadReviews(product.id)} />
      <div className={`sticky-buy ${showBar ? 'show' : ''}`} aria-hidden={!showBar}>
        <div><strong>{formatPrice(product.price)}</strong><span className="muted small">{product.name}</span></div>
        {waLink && <a className="btn btn-wa-icon" href={waLink} target="_blank" rel="noreferrer" aria-label="Order on WhatsApp" tabIndex={showBar ? 0 : -1}><FontAwesomeIcon icon={faWhatsapp} /></a>}
        <button className="btn btn-gold" disabled={soldOut} onClick={add} tabIndex={showBar ? 0 : -1}>{added ? 'Added ✓' : 'Add to cart'}</button>
      </div>
      <RelatedProducts product={product} />
      <RecentlyViewed key={product.id} currentId={product.id} />
    </main>
  )
}
