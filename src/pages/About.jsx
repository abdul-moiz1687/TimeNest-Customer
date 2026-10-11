import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import ClockArt from '../components/ClockArt'
import { CATEGORIES } from '../services/productApi'

const principles = [
  { n: '01', t: 'Designed for the wall', d: 'We look at a clock the way it will actually be seen: on a wall, in daylight, from across the room. Not only in a product photo.' },
  { n: '02', t: 'Easy to read', d: 'Beautiful should not mean hard to read. Every style we carry keeps the time clear at a glance.' },
  { n: '03', t: 'Honest by default', d: 'Prices and availability come straight from our store, and ratings are calculated only from real customer reviews.' },
]

const steps = [
  { t: 'Choose', d: 'Pick a style and size that suits your wall.' },
  { t: 'Order', d: 'Create an account and place your order. Pay by Cash on Delivery.' },
  { t: 'Follow', d: 'Check the status of every order from My Orders.' },
]

export default function About() {
  return (
    <main className="about">
      <Seo title="About" description="TimeNest is a wall clock brand built around one idea: a clock should be as considered as the room it hangs in." path="/about" />

      <section className="about-hero container">
        <div>
          <p className="eyebrow">About TimeNest</p>
          <h1>Clocks that give a wall something to say.</h1>
          <p className="lead">TimeNest is a wall clock brand built around one idea: a clock should be as considered as the room it hangs in.</p>
          <Link to="/shop" className="btn btn-gold">Shop the collection</Link>
        </div>
        <ClockArt />
      </section>

      <section className="section container">
        <div className="section-head"><p className="eyebrow">What we believe</p><h2>Three simple principles</h2></div>
        <div className="principles">
          {principles.map((p) => (
            <article key={p.n}>
              <span>{p.n}</span>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-styles">
        <div className="container">
          <div className="section-head"><p className="eyebrow">The collection</p><h2>Five styles, one standard</h2></div>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`}>
                  <span>{c.name}</span>
                  <em>{c.blurb}</em>
                  <b aria-hidden="true">→</b>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section container">
        <div className="section-head"><p className="eyebrow">Ordering</p><h2>Simple from start to finish</h2></div>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s.t}><span>{i + 1}</span><h3>{s.t}</h3><p>{s.d}</p></li>
          ))}
        </ol>
      </section>
    </main>
  )
}
