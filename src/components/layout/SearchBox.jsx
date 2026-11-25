import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { getProducts, optimizeImage, productPath } from '../../services/productApi'
import { formatPrice } from '../../utils/format'

// Search field with live suggestions (debounced, and results are cached by the API layer)
export default function SearchBox({ variant = 'nav', onDone }) {
  const [q, setQ] = useState('')
  const [state, setState] = useState({ loading: false, items: [] })
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const term = q.trim()

  useEffect(() => {
    if (term.length < 2) return
    let alive = true
    const t = setTimeout(() => {
      setState((s) => ({ ...s, loading: true }))
      getProducts({ search: term, limit: 5 })
        .then((d) => alive && setState({ loading: false, items: d.products }))
        .catch(() => alive && setState({ loading: false, items: [] }))
    }, 250)
    return () => { alive = false; clearTimeout(t) }
  }, [term])

  useEffect(() => {
    const onDoc = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [])

  // Press "/" anywhere (when not typing) to jump to the search box, like on modern sites
  useEffect(() => {
    if (variant !== 'nav') return
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.target.matches?.('input, textarea, select, [contenteditable="true"]')) return
      e.preventDefault()
      inputRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [variant])

  const finish = () => { setOpen(false); setQ(''); onDone?.() }
  const submit = (e) => {
    e.preventDefault()
    if (!term) return
    navigate(`/shop?search=${encodeURIComponent(term)}`)
    finish()
  }
  const show = open && term.length >= 2

  return (
    <div className={`sb sb-${variant}`} ref={boxRef}>
      <form className={variant === 'nav' ? 'nb-search' : 'drawer-search'} onSubmit={submit} role="search">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={variant === 'nav' ? 'Search' : 'Search clocks'}
          aria-label="Search clocks"
          autoComplete="off"
        />
        {variant === 'nav' && !q && <kbd className="sb-kbd" aria-hidden="true">/</kbd>}
        <button type="submit" aria-label="Search"><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
      </form>
      {show && (
        <div className="sb-results">
          {state.loading && state.items.length === 0 ? <p className="sb-empty">Searching…</p>
            : state.items.length === 0 ? <p className="sb-empty">No clocks found for “{term}”.</p>
            : (
              <>
                {state.items.map((p) => (
                  <Link key={p.id} to={productPath(p)} className="sb-item" onClick={finish}>
                    {p.image ? <img src={optimizeImage(p.image, 120)} alt="" /> : <span className="sb-noimg" />}
                    <span><b>{p.name}</b><small>{formatPrice(p.price)}</small></span>
                  </Link>
                ))}
                <button type="button" className="sb-all" onClick={submit}>See all results →</button>
              </>
            )}
        </div>
      )}
    </div>
  )
}
