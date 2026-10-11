import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandHoldingDollar, faTruckFast, faPenRuler, faStar } from '@fortawesome/free-solid-svg-icons'
import Seo from '../components/Seo'
import Hero from '../components/home/Hero'
import Categories from '../components/home/Categories'
import FeaturedProducts from '../components/home/FeaturedProducts'
import BlogPreview from '../components/home/BlogPreview'
import Reveal from '../components/Reveal'
import Marquee from '../components/home/Marquee'

const values = [
  { icon: faPenRuler, title: 'Considered design', text: 'Every style is chosen to look good on a wall, not just in a photo.' },
  { icon: faHandHoldingDollar, title: 'Cash on Delivery', text: 'Pay when your order arrives.' },
  { icon: faTruckFast, title: 'Track your order', text: 'Check your order status any time from My Orders.' },
  { icon: faStar, title: 'Honest reviews', text: 'Ratings come only from real customer reviews.' },
]

export default function Home() {
  return (
    <>
      <Seo
        description="TimeNest offers premium designer wall clocks in modern, luxury, wooden, decorative and office styles. Cash on Delivery available."
        path="/"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'Organization', name: 'TimeNest', description: 'Premium designer wall clocks.' }}
      />
      <Hero />
      <Marquee />
      <Reveal><Categories /></Reveal>
      <Reveal><FeaturedProducts /></Reveal>
      <Reveal>
      <section className="section values">
        <div className="container values-grid">
          {values.map((v) => (
            <div key={v.title}>
              <FontAwesomeIcon icon={v.icon} />
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>
      </Reveal>
      <Reveal><BlogPreview /></Reveal>
      <Reveal>
      <section className="section container cta">
        <h2>Find the clock your wall has been waiting for</h2>
        <Link to="/shop" className="btn btn-gold">Explore the collection</Link>
      </section>
      </Reveal>
    </>
  )
}
