import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'

const ITEMS = ['Modern', 'Luxury', 'Wooden', 'Decorative', 'Office', 'Cash on Delivery']

// Dobara repeat karte hain taake loop beech mein toote nahi
export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((k) => (
          <div className="marquee-group" key={k}>
            {ITEMS.map((t) => (
              <span key={`${k}-${t}`}>{t}<FontAwesomeIcon icon={faClock} /></span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
