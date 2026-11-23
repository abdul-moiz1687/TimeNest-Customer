import { Suspense, lazy, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons'

// The button is part of the main page so it shows up immediately.
// The chat window itself is a separate file that is only downloaded when it is needed.
const loadPanel = () => import('./ChatWidget')
const ChatWidget = lazy(loadPanel)
const TIP_KEY = 'timenest_chat_tip'

export default function ChatLauncher() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [tip, setTip] = useState(false)

  // Download the chat window quietly when the browser is idle, so the first click opens instantly
  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 3000))
    const id = idle(() => loadPanel())
    return () => window.cancelIdleCallback?.(id)
  }, [])

  // A small hint appears once per visit
  useEffect(() => {
    let seen = false
    try { seen = !!sessionStorage.getItem(TIP_KEY) } catch { /* storage unavailable */ }
    if (seen) return
    const t = setTimeout(() => setTip(true), 3500)
    return () => clearTimeout(t)
  }, [])

  const dismissTip = () => {
    setTip(false)
    try { sessionStorage.setItem(TIP_KEY, '1') } catch { /* storage unavailable */ }
  }
  const openChat = () => { dismissTip(); setMounted(true); setOpen(true) }

  return (
    <>
      <button className={`cb-fab ${open ? 'hide' : ''}`} onClick={openChat} onPointerEnter={loadPanel} aria-label="Open the shopping assistant">
        <span className="cb-fab-icon"><FontAwesomeIcon icon={faCommentDots} /></span>
        <span className="cb-fab-label">Ask us</span>
        <i className="cb-live" aria-hidden="true" />
      </button>
      {tip && !open && (
        <div className="cb-tip" role="status">
          <button className="cb-tip-text" onClick={openChat}>Need help choosing a clock?</button>
          <button className="cb-tip-x" onClick={dismissTip} aria-label="Dismiss">×</button>
        </div>
      )}
      {mounted && <Suspense fallback={null}><ChatWidget open={open} onClose={() => setOpen(false)} /></Suspense>}
    </>
  )
}
