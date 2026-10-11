import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faCircleQuestion, faBookOpen } from '@fortawesome/free-solid-svg-icons'
import Seo from '../components/Seo'
import { CONTACT_EMAIL } from '../utils/format'

const topics = ['Product question', 'My order', 'Choosing a size', 'Something else']

export default function Contact() {
  const [f, setF] = useState({ name: '', topic: topics[0], message: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`${f.topic} | ${f.name}`)
    const body = encodeURIComponent(`${f.message}\n\n${f.name}`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
  }

  return (
    <main className="container page contact">
      <Seo title="Contact" description="Get in touch with TimeNest about an order, a product or sizing." path="/contact" />
      <p className="eyebrow">Contact</p>
      <h1>Let's talk clocks.</h1>
      <p className="lead">Questions about a product, an order or the right size for your wall? Write to us and we will help.</p>

      <div className="contact-grid">
        <aside className="contact-side">
          <a className="contact-card" href={`mailto:${CONTACT_EMAIL}`}>
            <FontAwesomeIcon icon={faEnvelope} />
            <div><strong>Email</strong><span>{CONTACT_EMAIL}</span></div>
          </a>
          <Link className="contact-card" to="/faq">
            <FontAwesomeIcon icon={faCircleQuestion} />
            <div><strong>FAQ</strong><span>Payment, orders and reviews</span></div>
          </Link>
          <Link className="contact-card" to="/blog/how-to-choose-wall-clock-size">
            <FontAwesomeIcon icon={faBookOpen} />
            <div><strong>Sizing guide</strong><span>How to choose the right clock size</span></div>
          </Link>
        </aside>

        <form className="form contact-form" onSubmit={submit}>
          <label>Your name<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
          <label>Topic
            <select value={f.topic} onChange={set('topic')}>{topics.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label>Message<textarea required rows="6" value={f.message} onChange={set('message')} /></label>
          <button className="btn btn-gold">Send message</button>
          <p className="muted small">This opens your email app with the message ready to send.</p>
        </form>
      </div>
    </main>
  )
}
