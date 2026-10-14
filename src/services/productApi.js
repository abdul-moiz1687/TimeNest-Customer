import { apiRequest, API_BASE_URL } from './api'

export const CATEGORIES = [
  { name: 'Modern Wall Clocks', slug: 'modern', blurb: 'Clean lines for contemporary rooms.' },
  { name: 'Luxury Wall Clocks', slug: 'luxury', blurb: 'Statement pieces with refined finishes.' },
  { name: 'Wooden Wall Clocks', slug: 'wooden', blurb: 'Warm natural texture and craft.' },
  { name: 'Decorative Wall Clocks', slug: 'decorative', blurb: 'Art for the wall that tells time.' },
  { name: 'Office Wall Clocks', slug: 'office', blurb: 'Clear, quiet and professional.' },
]

const imgUrl = (i) => {
  if (!i) return ''
  const u = typeof i === 'string' ? i : i.url || i.secure_url || ''
  return u.startsWith('http') || !u ? u : `${API_BASE_URL}${u.startsWith('/') ? '' : '/'}${u}`
}

// Maps the API's field names to one consistent product shape
export function normalizeProduct(p = {}) {
  const images = (Array.isArray(p.images) ? p.images : []).map(imgUrl).filter(Boolean)
  const main = imgUrl(p.image) || images[0] || ''
  let stock = p.stock ?? p.countInStock ?? p.quantity ?? p.inStock
  // The backend stores availability as text, e.g. "In Stock" or "Out of Stock"
  if (stock == null && typeof p.availability === 'string' && p.availability) {
    stock = /out\s*of\s*stock|sold\s*out|unavailable/i.test(p.availability) ? 0 : 99
  }
  return {
    id: p._id || p.id,
    slug: p.slug || '',
    name: p.name || p.title || 'Wall Clock',
    price: Number(p.price) || 0,
    category: p.category || '',
    description: p.description || '',
    features: Array.isArray(p.features) ? p.features : [],
    images: images.length ? images : main ? [main] : [],
    image: main,
    stock: typeof stock === 'boolean' ? (stock ? 99 : 0) : stock == null ? null : Number(stock),
    averageRating: p.averageRating ?? p.rating ?? 0,
    numReviews: p.numReviews ?? p.totalReviews ?? p.reviewCount ?? 0,
  }
}

export function getProducts(params = {}) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => v !== '' && v != null && q.set(k, v))
  return cached(`list:${q}`, () => fetchProducts(q, params))
}

async function fetchProducts(q, params) {
  const data = await apiRequest(`/api/product?${q}`)
  const list = Array.isArray(data) ? data : data.products || data.data || data.items || []
  // The backend returns `{ products, pagination: { totalProducts, totalPages, ... } }`
  const pg = data.pagination || {}
  const total = pg.totalProducts ?? data.total ?? data.totalProducts ?? data.count ?? list.length
  const limit = Number(params.limit) || 12
  const pages = pg.totalPages ?? data.totalPages ?? data.pages ?? Math.max(1, Math.ceil(total / limit))
  return { products: list.map(normalizeProduct), total, pages }
}

export function getProduct(idOrSlug) {
  return cached(`one:${idOrSlug}`, () => fetchProduct(idOrSlug))
}

async function fetchProduct(idOrSlug) {
  const isId = /^[a-f\d]{24}$/i.test(idOrSlug)
  let data
  try {
    data = await apiRequest(isId ? `/api/product/${idOrSlug}` : `/api/product/slug/${idOrSlug}`)
  } catch (e) {
    if (isId) throw e
    data = await apiRequest(`/api/product/${idOrSlug}`)
  }
  return normalizeProduct(data.product || data)
}

// Cloudinary can resize and compress on the fly: smaller, modern-format images load much faster
export function optimizeImage(url, width) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
}
export const imageSrcSet = (url, widths = [400, 600, 900]) =>
  url && url.includes('res.cloudinary.com') ? widths.map((w) => `${optimizeImage(url, w)} ${w}w`).join(', ') : undefined

// Small in-memory cache: going back to a page shows data instantly, and duplicate requests are shared
const cache = new Map()
const TTL = 2 * 60 * 1000
function cached(key, load) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.t < TTL) return hit.p
  const p = load()
  cache.set(key, { t: Date.now(), p })
  p.catch(() => cache.delete(key))
  return p
}

export const productPath = (p) => `/product/${p.slug || p.id}`
