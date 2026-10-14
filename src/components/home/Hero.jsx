import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

const HEADLINE = 'Timeless Design. Made to Stand Out.'.split(' ')
const ease = [0.22, 1, 0.36, 1]

// Skip the video on Data Saver or very slow connections; the poster image is shown instead
const saveData = typeof navigator !== 'undefined' && (navigator.connection?.saveData || /2g/.test(navigator.connection?.effectiveType || ''))

export default function Hero() {
  const videoRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v || saveData) return
    // React does not always render the `muted` attribute, and browsers block unmuted autoplay
    v.muted = true
    v.defaultMuted = true
    let cleanup = () => {}
    v.play().catch(() => {
      // Autoplay blocked (e.g. low-power mode): start on the first touch or click instead
      const start = () => v.play().catch(() => {})
      window.addEventListener('touchstart', start, { once: true, passive: true })
      window.addEventListener('click', start, { once: true })
      cleanup = () => {
        window.removeEventListener('touchstart', start)
        window.removeEventListener('click', start)
      }
    })
    return () => cleanup()
  }, [])

  return (
    <section className="hero">
      {!saveData && <video
        ref={videoRef}
        className="hero-video"
        poster="/images/hero/hero-poster.jpg"
        muted
        loop
        playsInline
        disableRemotePlayback
        preload="metadata"
        aria-hidden="true"
        onError={() => console.warn('Hero video failed to load. Check /videos/timenest-hero.mp4')}
      >
        <source src="/videos/timenest-hero.mp4" type="video/mp4" />
      </video>}
      <div className="hero-overlay" />
      <div className="container hero-content">
        <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>TimeNest</motion.p>
        <h1 aria-label="Timeless Design. Made to Stand Out.">
          {HEADLINE.map((w, i) => (
            <span className="word-mask" key={i} aria-hidden="true">
              <motion.span
                className="word"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease }}
              >
                {w}&nbsp;
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p className="hero-sub" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9, ease }}>
          Premium wall clocks designed to transform your space.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1, ease }}>
          <Link to="/shop" className="btn btn-gold">SHOP NOW</Link>
        </motion.div>
      </div>
    </section>
  )
}
