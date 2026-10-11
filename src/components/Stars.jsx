import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'

export default function Stars({ value = 0, size = '0.85rem' }) {
  return (
    <span className="stars" role="img" aria-label={`${Number(value).toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <FontAwesomeIcon key={n} icon={faStar} style={{ fontSize: size }} className={n <= Math.round(value) ? 'on' : ''} />
      ))}
    </span>
  )
}
