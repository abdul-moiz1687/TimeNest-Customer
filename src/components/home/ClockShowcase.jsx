import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ClockArt from '../ClockArt'

const FINISHES = [
  { key: 'gold', label: 'Champagne Gold', color: '#c9a96a' },
  { key: 'walnut', label: 'Walnut', color: '#6b4427' },
  { key: 'chrome', label: 'Chrome', color: '#dfe3e8' },
  { key: 'black', label: 'Matte Black', color: '#1d1d1d' },
]

// Skip the 3D scene on Data Saver, reduced motion or when WebGL is missing; the SVG clock is shown instead
function canUse3D() {
  if (typeof window === 'undefined') return false
  if (navigator.connection?.saveData) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function ClockShowcase() {
  const hostRef = useRef(null)
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const [mode, setMode] = useState(() => (canUse3D() ? 'idle' : 'fallback'))
  const [finish, setFinish] = useState('gold')

  useEffect(() => {
    if (mode === 'fallback') return
    let alive = true
    let started = false
    // The 3D library is only downloaded when the section is about to scroll into view
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting || started) return
      started = true
      io.disconnect()
      try {
        const mod = await import('./clock3d')
        if (!alive) return
        sceneRef.current = mod.createClockScene(canvasRef.current, { onReady: () => alive && setMode('ready') })
      } catch {
        if (alive) setMode('fallback')
      }
    }, { rootMargin: '400px' })
    io.observe(hostRef.current)
    return () => {
      alive = false
      io.disconnect()
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { sceneRef.current?.setFinish(finish) }, [finish, mode])

  return (
    <section className="section container showcase" ref={hostRef}>
      <div className="showcase-copy">
        <p className="eyebrow">Interactive preview</p>
        <h2>Pick a finish.<br />Feel the detail.</h2>
        <p className="muted">
          A live 3D preview of the TimeNest design language. Move your cursor over the clock to turn it, then try the finishes.
          Finishes shown here are for illustration; each product page lists what is actually available.
        </p>
        <div className="finishes" role="radiogroup" aria-label="Clock finish">
          {FINISHES.map((f) => (
            <button key={f.key} role="radio" aria-checked={finish === f.key} className={finish === f.key ? 'on' : ''} onClick={() => setFinish(f.key)}>
              <i style={{ background: f.color }} />{f.label}
            </button>
          ))}
        </div>
        <Link to="/shop" className="btn btn-gold">Shop the collection</Link>
      </div>
      <div className="showcase-stage">
        <div ref={canvasRef} className="showcase-canvas" />
        <div className={`showcase-fallback ${mode === 'ready' ? 'hide' : ''}`}><ClockArt /></div>
      </div>
    </section>
  )
}
