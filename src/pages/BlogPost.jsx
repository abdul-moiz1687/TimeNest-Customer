import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import { blogPosts } from '../data/blogPosts'
import NotFound from './NotFound'

export default function BlogPost() {
  const { slug } = useParams()
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) return <NotFound />
  return (
    <main className="container page narrow prose">
      <Seo
        title={post.title}
        description={post.description}
        path={`/blog/${post.slug}`}
        type="article"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description: post.description, publisher: { '@type': 'Organization', name: 'TimeNest' } }}
      />
      <nav className="crumbs"><Link to="/blog">Journal</Link> / <span>{post.tag}</span></nav>
      <h1>{post.title}</h1>
      <p className="muted small">{post.readTime} min read</p>
      <p className="lead">{post.excerpt}</p>
      {post.sections.map((s) => (
        <section key={s.h}><h2>{s.h}</h2><p>{s.p}</p></section>
      ))}
      <p><Link to={post.related.to} className="btn btn-gold">{post.related.label}</Link></p>
    </main>
  )
}
