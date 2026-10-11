import ProductCard from './ProductCard'

export default function ProductGrid({ loading, error, products, count = 8 }) {
  if (loading)
    return (
      <div className="p-grid" aria-busy="true">
        {Array.from({ length: count }).map((_, i) => <div key={i} className="p-card skeleton" />)}
      </div>
    )
  if (error) return <p className="notice error">{error}</p>
  if (!products.length) return <p className="notice">Koi product nahi mila.</p>
  return (
    <div className="p-grid">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
