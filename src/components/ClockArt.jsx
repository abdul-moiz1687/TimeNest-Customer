import { useState } from 'react'

// Image ki zaroorat nahi: ek SVG clock jo asli waqt dikhata hai
export default function ClockArt({ className = '' }) {
  const [t] = useState(() => {
    const d = new Date()
    const s = d.getSeconds() + d.getMilliseconds() / 1000
    const m = d.getMinutes() * 60 + s
    const h = (d.getHours() % 12) * 3600 + m
    return { s, m, h }
  })
  const ticks = Array.from({ length: 60 }, (_, i) => i)

  return (
    <svg className={`clock-art ${className}`} viewBox="0 0 400 400" role="img" aria-label="Analog clock showing the current time">
      <circle cx="200" cy="200" r="190" fill="none" stroke="#c9a96a" strokeWidth="1" opacity="0.5" />
      <circle cx="200" cy="200" r="176" fill="none" stroke="#c9a96a" strokeWidth="0.5" opacity="0.3" />
      {ticks.map((i) => {
        const big = i % 5 === 0
        return (
          <line key={i} x1="200" y1={big ? 28 : 34} x2="200" y2="42" stroke="#c9a96a" strokeWidth={big ? 2 : 0.8}
            opacity={big ? 1 : 0.5} transform={`rotate(${i * 6} 200 200)`} />
        )
      })}
      <g className="hand h-hour" style={{ animationDelay: `-${t.h}s` }}><line x1="200" y1="200" x2="200" y2="120" stroke="#f5f0e6" strokeWidth="5" strokeLinecap="round" /></g>
      <g className="hand h-min" style={{ animationDelay: `-${t.m}s` }}><line x1="200" y1="200" x2="200" y2="70" stroke="#f5f0e6" strokeWidth="3" strokeLinecap="round" /></g>
      <g className="hand h-sec" style={{ animationDelay: `-${t.s}s` }}><line x1="200" y1="225" x2="200" y2="58" stroke="#c9a96a" strokeWidth="1.2" /></g>
      <circle cx="200" cy="200" r="6" fill="#c9a96a" />
    </svg>
  )
}
