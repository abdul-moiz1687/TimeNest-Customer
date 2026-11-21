import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'

// Navigates inside a View Transition (shared-element morph) where the browser supports it
export function useViewTransitionNavigate() {
  const navigate = useNavigate()
  return useCallback((to, options) => {
    const ok = typeof document !== 'undefined' && 'startViewTransition' in document
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!ok) { navigate(to, options); return }
    document.startViewTransition(() => {
      flushSync(() => navigate(to, options))
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  }, [navigate])
}
