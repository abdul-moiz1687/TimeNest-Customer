import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ClockArt from '../ClockArt'

const FINISHES = [
  { key: 'gold', label: 'Champagne Gold', color: '#c9a96a' },
  { key: 'walnut', label: 'Walnut', color: '#6b4427' },
  { key: 'chrome', label: 'Chrome', color: '#dfe3e8' },
  { key: 'black', label: 'Matte Black', color: '#1d1d1d' },
]

function checkEnv() {
  if (typeof window === 'undefined') return { webgl: false, saveData: false, calm: false }
  let webgl = false
  try {
    const c = document.createElement('canvas')
    webgl = !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    webgl = false
  }
  return {
    webgl,
    // Data Saver: wait for a tap instead of downloading the 3D library automatically
    saveData: !!navigator.connection?.saveData,
    // Reduced motion: still show the 3D clock, but without automatic movement
    calm: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
}

export default function ClockShowcase() {
  const hostRef = useRef(null)
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const busyRef = useRef(false)
  const aliveRef = useRef(true)
  const [env] = useState(checkEnv)
  const [mode, setMode] = useState(() => (env.webgl && !env.saveData ? 'idle' : 'fallback'))
  const [finish, setFinish] = useState('gold')

  const load = useCallback(async () => {
    if (sceneRef.current || busyRef.current || !canvasRef.current) return
    busyRef.current = true
    setMode('loading')
    try {
      const mod = await import('./clock3d')
      if (!aliveRef.current) return
      const opts = { calm: env.calm, onReady: () => aliveRef.current && setMode('ready') }
      try {
        sceneRef.current = mod.createClockScene(canvasRef.current, opts)
      } catch (e) {
        // Weak GPU: retry with the lighter version before giving up
        console.warn('3D clock: full quality failed, trying lite mode.', e)
        canvasRef.current.replaceChildren()
        sceneRef.current = mod.createClockScene(canvasRef.current, { ...opts, lite: true })
      }
    } catch (e) {
      console.warn('3D clock unavailable:', e)
      if (aliveRef.current) setMode('fallback')
    } finally {
      busyRef.current = false
    }
  }, [env.calm])

  // The 3D library is only downloaded when the section is about to scroll into view
  useEffect(() => {
    aliveRef.current = true
    let io
    if (mode === 'idle') {
      io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { io.disconnect(); load() }
      }, { rootMargin: '400px' })
      io.observe(hostRef.current)
    }
    return () => {
      aliveRef.current = false
      io?.disconnect()
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
          A live 3D preview of the TimeNest design language. Drag over the clock to turn it, then try the finishes.
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
        {mode === 'fallback' && env.webgl && (
          <button className="btn btn-ghost showcase-load" onClick={load}>View in 3D</button>
        )}
      </div>
    </section>
  )
}
