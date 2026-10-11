import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

const HEADLINE = 'Timeless Design. Made to Stand Out.'.split(' ')
const ease = [0.22, 1, 0.36, 1]

export default function Hero() {
  const videoRef = useRef(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    // React kabhi muted attribute DOM mein nahi lagata, isliye browser autoplay block kar deta hai
    v.muted = true
    v.defaultMuted = true
    if (reduced) { v.pause(); return }
    v.play().catch((e) => console.warn('Hero video play nahi hui:', e.message))
  }, [reduced])

  return (
    <section className="hero">
      <video
        ref={videoRef}
        className="hero-video"
        poster="/images/hero/hero-poster.jpg"
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onError={() => console.warn('Hero video load nahi hui. /videos/timenest-hero.mp4 check karo.')}
      >
        <source src="/videos/timenest-hero.mp4" type="video/mp4" />
      </video>
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
