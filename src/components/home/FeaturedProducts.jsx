import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../../services/productApi'
import ProductGrid from '../products/ProductGrid'

export default function FeaturedProducts() {
  const [state, setState] = useState({ loading: true, error: '', products: [] })

  useEffect(() => {
    let alive = true
    getProducts({ limit: 4, page: 1 })
      .then((d) => alive && setState({ loading: false, error: '', products: d.products }))
      .catch((e) => alive && setState({ loading: false, error: e.message, products: [] }))
    return () => { alive = false }
  }, [])

  return (
    <section className="section container">
      <div className="section-head row">
        <div>
          <p className="eyebrow">Featured</p>
          <h2>Pieces to start with</h2>
        </div>
        <Link to="/shop" className="text-link">View all →</Link>
      </div>
      <ProductGrid {...state} count={4} />
    </section>
  )
}
