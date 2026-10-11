import { useState } from 'react'
import { CATEGORIES } from '../../services/productApi'

export default function ProductFilters({ values, onApply, onClear, showCategory = true }) {
  const [v, setV] = useState(values)
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })
  return (
    <form className="filters" onSubmit={(e) => { e.preventDefault(); onApply(v) }}>
      <label>Search
        <input value={v.search} onChange={set('search')} placeholder="e.g. wooden" />
      </label>
      {showCategory && (
        <label>Category
          <select value={v.category} onChange={set('category')}>
            <option value="">All</option>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
          </select>
        </label>
      )}
      <label>Min price
        <input type="number" min="0" value={v.minPrice} onChange={set('minPrice')} />
      </label>
      <label>Max price
        <input type="number" min="0" value={v.maxPrice} onChange={set('maxPrice')} />
      </label>
      <div className="filter-actions">
        <button className="btn btn-gold" type="submit">Apply</button>
        <button className="btn btn-ghost" type="button" onClick={() => { onClear(); setV({ search: '', category: '', minPrice: '', maxPrice: '' }) }}>Clear</button>
      </div>
    </form>
  )
}
