import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../services/productApi'

export default function Categories() {
  return (
    <section className="section container">
      <div className="section-head">
        <p className="eyebrow">Collections</p>
        <h2>Shop by style</h2>
      </div>
      <div className="cat-grid">
        {CATEGORIES.map((c, i) => (
          <Link key={c.slug} to={`/category/${c.slug}`} className="cat-card">
            <span className="cat-num">0{i + 1}</span>
            <h3>{c.name}</h3>
            <p>{c.blurb}</p>
            <span className="cat-link">Explore →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
