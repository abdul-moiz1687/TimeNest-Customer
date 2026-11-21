import { useEffect, useRef, useState } from 'react'
import { useViewTransitionNavigate } from '../../utils/viewTransition'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faPlus } from '@fortawesome/free-solid-svg-icons'
import { imageSrcSet, optimizeImage, productPath } from '../../services/productApi'
import { formatPrice } from '../../utils/format'
import { useCart } from '../../context/CartContext'
import Stars from '../Stars'

// On touch screens the card nearest the middle of the screen gets highlighted while scrolling
const TOUCH = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

// 3D tilt only on devices with a mouse, and not for users who prefer reduced motion
const TILT_OK = typeof window !== 'undefined'
  && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

const preloadProductPage = () => import('../../pages/ProductDetails')

export default function ProductCard({ product }) {
  const ref = useRef(null)
  const goTo = useViewTransitionNavigate()
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const soldOut = product.stock === 0

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1600)
    return () => clearTimeout(t)
  }, [added])

  useEffect(() => {
    const el = ref.current
    if (!TOUCH || !el) return
    const io = new IntersectionObserver(([e]) => el.classList.toggle('in-focus', e.isIntersecting), { rootMargin: '-38% 0px -38% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const add = () => { addItem(product); setAdded(true) }

  // Plain clicks morph the card image into the product page image; ctrl/cmd-click still opens a new tab
  const open = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    const img = ref.current?.querySelector('.pc-media img')
    if (img) img.style.viewTransitionName = `pimg-${product.id}`
    goTo(productPath(product), { state: { product, vt: true } })
  }

  const onMove = (e) => {
    if (!TILT_OK || !ref.current) return
    const el = ref.current
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`)
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <article className="pc" ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="pc-media">
        <Link to={productPath(product)} aria-label={product.name} onClick={open} onPointerEnter={preloadProductPage}>
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
        <h3><Link to={productPath(product)} onClick={open} onPointerEnter={preloadProductPage}>{product.name}</Link></h3>
        <div className="pc-meta">
          <strong>{formatPrice(product.price)}</strong>
          {product.numReviews > 0 && <span className="pc-rating"><Stars value={product.averageRating} size="0.75rem" /> <small>({product.numReviews})</small></span>}
        </div>
      </div>
    </article>
  )
}
