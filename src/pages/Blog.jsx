import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { blogPosts } from '../data/blogPosts'

export default function Blog() {
  const [first, ...rest] = blogPosts
  return (
    <main className="container page">
      <Seo title="Journal" description="Guides on choosing, styling and caring for wall clocks from the TimeNest journal." path="/blog" />
      <p className="eyebrow">Journal</p>
      <h1>Ideas for your walls</h1>
      <Link to={`/blog/${first.slug}`} className="blog-feature">
        <span className="blog-tag">{first.tag}</span>
        <h2>{first.title}</h2>
        <p>{first.excerpt}</p>
        <span className="muted small">{first.readTime} min read</span>
      </Link>
      <div className="blog-grid">
        {rest.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="blog-card">
            <span className="blog-tag">{p.tag}</span>
            <h3>{p.title}</h3>
            <p>{p.excerpt}</p>
            <span className="muted small">{p.readTime} min read</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
