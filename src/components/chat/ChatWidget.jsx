import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentDots, faPaperPlane, faXmark, faPlus } from '@fortawesome/free-solid-svg-icons'
import { apiRequest } from '../../services/api'
import { normalizeProduct, optimizeImage, productPath } from '../../services/productApi'
import { formatPrice } from '../../utils/format'
import { useCart } from '../../context/CartContext'

const GREETING = {
  role: 'assistant',
  text: 'Assalam o Alaikum! I can help you pick a clock from our collection. Tell me the room, the style or your budget.',
  products: [],
}
const SUGGESTIONS = ['Help me choose a clock', 'Something modern and minimal', 'A wooden clock for the bedroom', 'Gift ideas']

function MiniProduct({ product, onNavigate }) {
  const { addItem } = useCart()
  const p = normalizeProduct({ ...product, _id: product.id })
  const soldOut = /out\s*of\s*stock/i.test(product.availability || '')
  return (
    <div className="cb-product">
      <Link to={productPath(p)} onClick={onNavigate} className="cb-thumb">
        {p.image && <img src={optimizeImage(p.image, 160)} alt={p.name} loading="lazy" />}
      </Link>
      <div className="cb-pinfo">
        <Link to={productPath(p)} onClick={onNavigate}><strong>{p.name}</strong></Link>
        <span>{formatPrice(p.price)}</span>
      </div>
      <button className="cb-add" disabled={soldOut} onClick={() => addItem(p)} aria-label={`Add ${p.name} to cart`}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  const send = async (text) => {
    const q = text.trim()
    if (!q || busy) return
    const next = [...messages, { role: 'user', text: q, products: [] }]
    setMessages(next)
    setInput('')
    setError('')
    setBusy(true)
    try {
      // Only role and text are sent (the last few turns), never anything about the visitor
      const history = next.slice(1).map((m) => ({ role: m.role, text: m.text })).slice(-8)
      const data = await apiRequest('/api/chat', { method: 'POST', body: { messages: history } })
      setMessages((m) => [...m, { role: 'assistant', text: data.reply, products: data.products || [] }])
    } catch (e) {
      setError(e.message || 'The assistant is not available right now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button className={`cb-fab ${open ? 'hide' : ''}`} onClick={() => setOpen(true)} aria-label="Open the shopping assistant">
        <FontAwesomeIcon icon={faCommentDots} />
        <span>Ask us</span>
      </button>

      {open && (
        <section className="cb" role="dialog" aria-label="TimeNest shopping assistant">
          <header className="cb-head">
            <div><strong>TimeNest Assistant</strong><span>Helps you choose a clock</span></div>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close assistant"><FontAwesomeIcon icon={faXmark} /></button>
          </header>

          <div className="cb-list" ref={listRef} aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`cb-msg ${m.role}`}>
                <p>{m.text}</p>
                {m.products?.length > 0 && (
                  <div className="cb-products">
                    {m.products.map((p) => <MiniProduct key={p.id} product={p} onNavigate={() => window.matchMedia('(max-width: 800px)').matches && setOpen(false)} />)}
                  </div>
                )}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="cb-chips">{SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}</div>
            )}
            {busy && <div className="cb-msg assistant"><span className="cb-dots"><i /><i /><i /></span></div>}
            {error && <p className="cb-error" role="alert">{error}</p>}
          </div>

          <form className="cb-form" onSubmit={(e) => { e.preventDefault(); send(input) }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={300} placeholder="Ask about a clock…" aria-label="Your question" />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send"><FontAwesomeIcon icon={faPaperPlane} /></button>
          </form>
          <p className="cb-note">AI assistant. Prices come from our store. Please do not share personal details.</p>
        </section>
      )}
    </>
  )
}
