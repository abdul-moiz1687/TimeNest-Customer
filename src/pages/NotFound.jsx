import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

export default function NotFound() {
  return (
    <main className="container page narrow center">
      <Seo title="Page Not Found" description="This page could not be found." path="/404" />
      <meta name="robots" content="noindex" />
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist or has moved.</p>
      <Link to="/shop" className="btn btn-gold">Go to shop</Link>
    </main>
  )
}
