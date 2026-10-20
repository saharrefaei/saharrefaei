import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Boundary } from '../world/boundaries'
import { detail, useDetail } from './detailStore'
import { loadOverlay } from './loadOverlay'

const DetailOverlay = lazy(loadOverlay)

/**
 * Wraps the whole page. Behind an open detail view it is `inert`: nothing in it can take focus or be
 * clicked. It is its own subscriber so opening and closing re-renders nothing else: `children` keeps
 * its identity, so React skips the entire page (and the 3D scene) below it.
 */
export function InertScope({ children }: { children: ReactNode }) {
  const open = useDetail().ref !== null
  return (
    <div className="app" inert={open}>
      {children}
    </div>
  )
}

/**
 * Everything that has to hold the instant a detail view opens, independent of whether its chunk has
 * arrived yet:
 *  - the page behind cannot scroll, so the 3D camera (driven by scroll) stays exactly where it is
 *  - the background is inert (see InertScope), so nothing behind can take focus
 *  - the WebGL scenes pause (see FramePause)
 * and on close, scroll position and keyboard focus go back to where they were.
 */
export function DetailHost() {
  const { ref } = useDetail()
  const open = ref !== null

  // The overlay chunk can fail to load (a stale tab after a redeploy requests a hashed file that no longer
  // exists). That must never take the page down or leave the visitor locked behind an overlay that never
  // shows: when a view is open and the overlay is broken, reload once on the same URL (which fetches a fresh
  // build and opens straight into the view); if that has just been tried, close the view instead.
  const [broken, setBroken] = useState(false)
  useEffect(() => {
    if (!broken || !open) return
    let recent = false
    try {
      recent = Date.now() - Number(sessionStorage.getItem('detail-reload') ?? 0) < 15000
      if (!recent) sessionStorage.setItem('detail-reload', String(Date.now()))
    } catch {
      // storage unavailable: treat as already tried, so there is no reload loop
      recent = true
    }
    if (recent) detail.close()
    else window.location.reload()
  }, [broken, open])

  // The overlay chunk loads on idle; a deep link (open at startup) needs it immediately.
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    const request = window.requestIdleCallback as typeof window.requestIdleCallback | undefined
    if (request) {
      const handle = request(() => setIdle(true), { timeout: 6000 })
      return () => window.cancelIdleCallback(handle)
    }
    const handle = window.setTimeout(() => setIdle(true), 3000)
    return () => window.clearTimeout(handle)
  }, [])

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    root.dataset.detail = 'open'
    return () => {
      root.style.overflow = previousOverflow
      delete root.dataset.detail
      const { scrollY, focusTarget } = detail.restoration()
      // scroll is locked while open, so this is a safety net: put the exact position back
      if (scrollY !== null && Math.abs(window.scrollY - scrollY) > 1) window.scrollTo({ top: scrollY, behavior: 'instant' })
      if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true })
      detail.clearFocusTarget()
    }
  }, [open])

  if (!open && !idle) return null
  return (
    <Boundary onError={() => setBroken(true)}>
      <Suspense fallback={null}>
        <DetailOverlay />
      </Suspense>
    </Boundary>
  )
}
