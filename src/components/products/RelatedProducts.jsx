import { useEffect, useState } from 'react'
import { getProducts } from '../../services/productApi'
import ProductGrid from './ProductGrid'

export default function RelatedProducts({ product }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    let alive = true
    getProducts({ category: product.category, limit: 6 })
      .then((d) => alive && setItems(d.products.filter((p) => p.id !== product.id).slice(0, 4)))
      .catch(() => {})
    return () => { alive = false }
  }, [product.id, product.category])

  if (!items.length) return null
  return (
    <section className="related">
      <h2>You may also like</h2>
      <ProductGrid products={items} loading={false} error="" />
    </section>
  )
}
