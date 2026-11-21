import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { getProducts } from '../../services/productApi'
import { formatPrice } from '../../utils/format'
import ProductCard from '../products/ProductCard'

const ROOMS = [
  { key: 'living', label: 'Living room' },
  { key: 'bedroom', label: 'Bedroom' },
  { key: 'office', label: 'Office or study' },
  { key: 'kitchen', label: 'Kitchen or hallway' },
]
const STYLES = [
  { key: 'Modern Wall Clocks', label: 'Modern', hint: 'Clean and minimal' },
  { key: 'Luxury Wall Clocks', label: 'Luxury', hint: 'Refined statement piece' },
  { key: 'Wooden Wall Clocks', label: 'Wooden', hint: 'Warm and natural' },
  { key: 'Decorative Wall Clocks', label: 'Decorative', hint: 'Art for the wall' },
  { key: 'any', label: 'Surprise me', hint: 'Show me the best fits' },
]
// Which categories tend to suit which room (a simple rule of thumb, not a hard rule)
const ROOM_FIT = {
  living: ['Luxury Wall Clocks', 'Decorative Wall Clocks', 'Modern Wall Clocks'],
  bedroom: ['Wooden Wall Clocks', 'Modern Wall Clocks'],
  office: ['Office Wall Clocks', 'Modern Wall Clocks'],
  kitchen: ['Modern Wall Clocks', 'Office Wall Clocks', 'Wooden Wall Clocks'],
}

function bands(items) {
  const prices = items.map((p) => p.price).sort((a, b) => a - b)
  if (!prices.length) return null
  return { low: prices[Math.floor((prices.length - 1) * 0.33)], high: prices[Math.floor((prices.length - 1) * 0.66)] }
}

export default function ClockQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ room: '', style: '', budget: '' })
  const [catalog, setCatalog] = useState({ state: 'idle', items: [] })

  const load = () => {
    if (catalog.state !== 'idle') return
    setCatalog({ state: 'loading', items: [] })
    getProducts({ limit: 50 })
      .then((d) => setCatalog({ state: 'ready', items: d.products }))
      .catch(() => setCatalog({ state: 'error', items: [] }))
  }

  const pick = (key, value) => {
    load()
    setAnswers((a) => ({ ...a, [key]: value }))
    setStep((s) => s + 1)
  }
  const restart = () => { setAnswers({ room: '', style: '', budget: '' }); setStep(0) }

  const b = useMemo(() => bands(catalog.items), [catalog.items])
  const budgets = [
    { key: 'low', label: 'Budget friendly', hint: b ? `Up to ${formatPrice(b.low)}` : '' },
    { key: 'mid', label: 'Mid range', hint: b ? `${formatPrice(b.low)} to ${formatPrice(b.high)}` : '' },
    { key: 'high', label: 'Premium', hint: b ? `Above ${formatPrice(b.high)}` : '' },
    { key: 'any', label: 'No limit', hint: 'Show me everything' },
  ]

  const results = useMemo(() => {
    if (step < 3) return []
    const fit = ROOM_FIT[answers.room] || []
    return catalog.items
      .filter((p) => p.stock !== 0)
      .map((p) => {
        let score = 0
        const why = []
        if (answers.style === 'any' || p.category === answers.style) { score += answers.style === 'any' ? 0 : 4; if (answers.style !== 'any') why.push(`${String(p.category).replace(' Wall Clocks', '')} style`) }
        const idx = fit.indexOf(p.category)
        if (idx >= 0) { score += idx === 0 ? 3 : 2; why.push(`Suits a ${ROOMS.find((r) => r.key === answers.room)?.label.toLowerCase()}`) }
        if (b && answers.budget !== 'any') {
          const inBand = answers.budget === 'low' ? p.price <= b.low : answers.budget === 'mid' ? p.price > b.low && p.price <= b.high : p.price > b.high
          if (inBand) { score += 3; why.push('In your budget') }
        }
        return { product: p, score, why }
      })
      .sort((x, y) => y.score - x.score || x.product.price - y.product.price)
      .slice(0, 3)
  }, [step, answers, catalog.items, b])

  const questions = [
    { title: 'Where will the clock go?', options: ROOMS.map((o) => ({ ...o, hint: '' })), key: 'room' },
    { title: 'Which look do you like?', options: STYLES, key: 'style' },
    { title: 'What is your budget?', options: budgets, key: 'budget' },
  ]

  return (
    <section className="section container quiz">
      <div className="quiz-card">
        <p className="eyebrow">Find your clock</p>
        <AnimatePresence mode="wait">
          {step < 3 ? (
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
              <h2>{questions[step].title}</h2>
              <div className="quiz-options">
                {questions[step].options.map((o) => (
                  <button key={o.key} onClick={() => pick(questions[step].key, o.key)}>
                    <strong>{o.label}</strong>
                    {o.hint && <span>{o.hint}</span>}
                  </button>
                ))}
              </div>
              <div className="quiz-foot">
                <div className="quiz-dots" aria-label={`Question ${step + 1} of 3`}>{[0, 1, 2].map((i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
                {step > 0 && <button className="link-btn" onClick={() => setStep(step - 1)}>Back</button>}
              </div>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h2>Your top picks</h2>
              {catalog.state === 'loading' && <div className="skeleton" style={{ minHeight: 220 }} />}
              {catalog.state === 'error' && <p className="notice error">We could not load the collection. Please try again.</p>}
              {catalog.state === 'ready' && results.length === 0 && <p className="notice">No matching clocks right now. Try different answers.</p>}
              <div className="p-grid quiz-grid">
                {results.map((r) => (
                  <div key={r.product.id}>
                    <ProductCard product={r.product} />
                    {r.why.length > 0 && <p className="quiz-why">{r.why.join(' · ')}</p>}
                  </div>
                ))}
              </div>
              <button className="link-btn" onClick={restart}>Start over</button>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="muted small quiz-note">Suggestions come from our current collection and simple style rules.</p>
      </div>
    </section>
  )
}
