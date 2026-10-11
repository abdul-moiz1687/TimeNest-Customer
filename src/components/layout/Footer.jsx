import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { CATEGORIES } from '../../services/productApi'
import Reveal from '../Reveal'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="ft">
      <Reveal>
        <div className="container ft-cta">
          <h2>Give your wall a<br />reason to look up.</h2>
          <Link to="/shop" className="btn btn-gold">Shop the collection</Link>
        </div>
      </Reveal>

      <div className="container ft-grid">
        <div className="ft-brand">
          <Link to="/" className="logo">Time<span>Nest</span></Link>
          <p>Premium wall clocks designed to transform your space.</p>
          <p className="ft-pay">Cash on Delivery available</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop">All clocks</Link></li>
            {CATEGORIES.map((c) => <li key={c.slug}><Link to={`/category/${c.slug}`}>{c.name.replace(' Wall Clocks', '')}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/blog">Journal</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Create account</Link></li>
            <li><Link to="/my-orders">My orders</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>
      </div>

      <div className="ft-word" aria-hidden="true">TimeNest</div>

      <div className="container ft-bottom">
        <span>© {YEAR} TimeNest. All rights reserved.</span>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
          Back to top <FontAwesomeIcon icon={faArrowUp} />
        </button>
      </div>
    </footer>
  )
}
