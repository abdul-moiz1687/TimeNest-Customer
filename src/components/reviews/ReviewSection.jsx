import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createReview } from '../../services/reviewApi'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/format'
import Stars from '../Stars'

export default function ReviewSection({ productId, data, onSubmitted }) {
  const { isLoggedIn, token } = useAuth()
  const location = useLocation()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    if (comment.trim().length < 3) return setMsg({ type: 'error', text: 'Please write a short comment.' })
    setBusy(true)
    setMsg({ type: '', text: '' })
    try {
      await createReview(token, productId, rating, comment.trim())
      setComment('')
      setMsg({ type: 'ok', text: 'Thank you, your review has been submitted.' })
      onSubmitted()
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="reviews" id="reviews">
      <h2>Reviews</h2>
      {data?.total > 0 ? (
        <p className="rating-line"><Stars value={data.average} size="1.1rem" /> <strong>{data.average.toFixed(1)}</strong> <span className="muted">based on {data.total} review(s)</span></p>
      ) : (
        <p className="muted">No reviews yet.</p>
      )}

      <ul className="review-list">
        {(data?.reviews || []).map((r) => (
          <li key={r._id || `${r.createdAt}-${r.comment}`}>
            <div className="review-top">
              <strong>{r.user?.name || r.name || r.customerName || 'Customer'}</strong>
              <Stars value={r.rating} />
              <span className="muted small">{formatDate(r.createdAt)}</span>
            </div>
            <p>{r.comment}</p>
          </li>
        ))}
      </ul>

      {isLoggedIn ? (
        <form className="form review-form" onSubmit={submit}>
          <h3>Write a review</h3>
          <label>Rating
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}
            </select>
          </label>
          <label>Your review
            <textarea rows="4" value={comment} onChange={(e) => setComment(e.target.value)} />
          </label>
          {msg.text && <p className={`notice ${msg.type}`}>{msg.text}</p>}
          <button className="btn btn-gold" disabled={busy}>{busy ? 'Submitting…' : 'Submit review'}</button>
        </form>
      ) : (
        <p className="notice"><Link to="/login" state={{ from: location.pathname }} className="text-link">Login</Link> to write a review.</p>
      )}
    </section>
  )
}
