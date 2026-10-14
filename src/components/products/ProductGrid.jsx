import { motion } from 'motion/react'
import ProductCard from './ProductCard'

export default function ProductGrid({ loading, error, products, count = 8 }) {
  if (loading)
    return (
      <div className="p-grid" aria-busy="true">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="pc-skel"><div className="skeleton pc-skel-img" /><div className="skeleton pc-skel-line" /><div className="skeleton pc-skel-line short" /></div>
        ))}
      </div>
    )
  if (error) return <p className="notice error">{error}</p>
  if (!products.length) return <p className="notice">No products found. Try changing your filters.</p>
  return (
    <div className="p-grid">
      {products.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.6, delay: (i % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProductCard product={p} />
        </motion.div>
      ))}
    </div>
  )
}
