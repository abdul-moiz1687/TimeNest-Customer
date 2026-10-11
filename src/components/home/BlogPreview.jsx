import { Link } from 'react-router-dom'
import { blogPosts } from '../../data/blogPosts'

export default function BlogPreview() {
  return (
    <section className="section container">
      <div className="section-head row">
        <div>
          <p className="eyebrow">Journal</p>
          <h2>Ideas for your walls</h2>
        </div>
        <Link to="/blog" className="text-link">All articles →</Link>
      </div>
      <div className="blog-grid">
        {blogPosts.slice(0, 3).map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="blog-card">
            <span className="blog-tag">{p.tag}</span>
            <h3>{p.title}</h3>
            <p>{p.excerpt}</p>
            <span className="muted small">{p.readTime} min read</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
