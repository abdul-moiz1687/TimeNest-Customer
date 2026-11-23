import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faPaperPlane, faPlus, faRotateRight, faXmark } from '@fortawesome/free-solid-svg-icons'
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
const isMobile = () => window.matchMedia('(max-width: 800px)').matches

function MiniProduct({ product, onNavigate }) {
  const { addItem } = useCart()
  const p = normalizeProduct({ ...product, _id: product.id })
  const soldOut = /out\s*of\s*stock/i.test(product.availability || '')
  return (
    <div className="cb-product">
      <Link to={productPath(p)} onClick={onNavigate} className="cb-thumb">
        {p.image && <img src={optimizeImage(p.image, 200)} alt={p.name} loading="lazy" />}
      </Link>
      <div className="cb-pinfo">
        <strong>{p.name}</strong>
        <span>{formatPrice(p.price)}</span>
        <div className="cb-pact">
          <Link to={productPath(p)} onClick={onNavigate}>View</Link>
          <button disabled={soldOut} onClick={() => addItem(p)}><FontAwesomeIcon icon={faPlus} /> {soldOut ? 'Sold out' : 'Add'}</button>
        </div>
      </div>
    </div>
  )
}

export default function ChatWidget({ open, onClose }) {
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const panelRef = useRef(null)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  // Focus the box, close with Escape, and on phones lock the page behind the chat
  useEffect(() => {
    if (!open) return
    inputRef.current?.focus({ preventScroll: true })
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const lock = isMobile()
    if (lock) document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); if (lock) document.body.style.overflow = '' }
  }, [open, onClose])

  // On phones the chat follows the visible area, so the input stays above the keyboard
  useEffect(() => {
    const vv = window.visualViewport
    if (!open || !vv || !isMobile()) return
    const set = () => {
      panelRef.current?.style.setProperty('--vvh', `${vv.height}px`)
      panelRef.current?.style.setProperty('--vvt', `${vv.offsetTop}px`)
    }
    set()
    vv.addEventListener('resize', set)
    vv.addEventListener('scroll', set)
    return () => { vv.removeEventListener('resize', set); vv.removeEventListener('scroll', set) }
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy, error, open])

  const ask = async (history) => {
    setBusy(true)
    setError('')
    try {
      // Only role and text (the last few turns) are sent, never anything about the visitor
      const body = { messages: history.slice(1).map((m) => ({ role: m.role, text: m.text })).slice(-8) }
      const data = await apiRequest('/api/chat', { method: 'POST', body })
      setMessages((m) => [...m, { role: 'assistant', text: data.reply, products: data.products || [] }])
    } catch (e) {
      setError(e.message || 'The assistant is not available right now.')
    } finally {
      setBusy(false)
    }
  }

  const send = (text) => {
    const q = text.trim()
    if (!q || busy) return
    const next = [...messages, { role: 'user', text: q, products: [] }]
    setMessages(next)
    setInput('')
    ask(next)
  }
  const reset = () => { if (busy) return; setMessages([GREETING]); setError(''); setInput('') }
  const closeOnPhone = () => { if (isMobile()) onClose() }

  return (
    <section ref={panelRef} className={`cb ${open ? '' : 'closed'}`} role="dialog" aria-label="TimeNest shopping assistant" aria-hidden={!open}>
      <header className="cb-head">
        <span className="cb-avatar"><FontAwesomeIcon icon={faClock} /></span>
        <div className="cb-title"><strong>TimeNest Assistant</strong><span>AI helper for choosing a clock</span></div>
        <button className="icon-btn" onClick={reset} aria-label="Start a new chat" title="New chat"><FontAwesomeIcon icon={faRotateRight} /></button>
        <button className="icon-btn" onClick={onClose} aria-label="Close assistant"><FontAwesomeIcon icon={faXmark} /></button>
      </header>

      <div className="cb-list" ref={listRef} aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`cb-msg ${m.role}`}>
            <p>{m.text}</p>
            {m.products?.length > 0 && (
              <div className="cb-products">
                {m.products.map((p) => <MiniProduct key={p.id} product={p} onNavigate={closeOnPhone} />)}
              </div>
            )}
          </div>
        ))}
        {messages.length === 1 && (
          <div className="cb-chips">{SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}</div>
        )}
        {busy && <div className="cb-msg assistant"><span className="cb-dots"><i /><i /><i /></span></div>}
        {error && (
          <div className="cb-error" role="alert">
            <p>{error}</p>
            <button onClick={() => ask(messages)}><FontAwesomeIcon icon={faRotateRight} /> Try again</button>
          </div>
        )}
      </div>

      <form className="cb-form" onSubmit={(e) => { e.preventDefault(); send(input) }}>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={300} placeholder="Ask about a clock…" aria-label="Your question" enterKeyHint="send" />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send"><FontAwesomeIcon icon={faPaperPlane} /></button>
      </form>
      <p className="cb-note">AI assistant. Prices come from our store. Please do not share personal details.</p>
    </section>
  )
}
