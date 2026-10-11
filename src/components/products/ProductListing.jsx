import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../../services/productApi'
import ProductFilters from './ProductFilters'
import ProductGrid from './ProductGrid'
import Pagination from './Pagination'

const LIMIT = 12

// Shared by the Shop and Category pages
export default function ProductListing({ fixedCategory }) {
  const [sp, setSp] = useSearchParams()
  const [state, setState] = useState({ loading: true, error: '', products: [], total: 0, pages: 1 })

  const search = sp.get('search') || ''
  const category = fixedCategory || sp.get('category') || ''
  const minPrice = sp.get('minPrice') || ''
  const maxPrice = sp.get('maxPrice') || ''
  const page = Math.max(1, Number(sp.get('page')) || 1)

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: '' }))
    getProducts({ search, category, minPrice, maxPrice, page, limit: LIMIT })
      .then((d) => alive && setState({ loading: false, error: '', ...d }))
      .catch((e) => alive && setState({ loading: false, error: e.message, products: [], total: 0, pages: 1 }))
    return () => { alive = false }
  }, [search, category, minPrice, maxPrice, page])

  const apply = (v) => {
    const next = {}
    if (v.search) next.search = v.search
    if (!fixedCategory && v.category) next.category = v.category
    if (v.minPrice) next.minPrice = v.minPrice
    if (v.maxPrice) next.maxPrice = v.maxPrice
    setSp(next)
  }
  const goPage = (n) => {
    const next = Object.fromEntries(sp)
    next.page = n
    setSp(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="listing">
      <aside>
        <ProductFilters
          key={sp.toString()}
          values={{ search, category, minPrice, maxPrice }}
          onApply={apply}
          onClear={() => setSp({})}
          showCategory={!fixedCategory}
        />
      </aside>
      <div>
        {!state.loading && !state.error && <p className="muted small result-count">{state.total} product(s)</p>}
        <ProductGrid loading={state.loading} error={state.error} products={state.products} count={LIMIT} />
        <Pagination page={page} pages={state.pages} onChange={goPage} />
      </div>
    </div>
  )
}
