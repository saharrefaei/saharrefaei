import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { isLowEndDevice, supportsWebGL } from '../lib/capabilities'

const SceneLayer = lazy(() => import('./SceneLayer'))

/** If anything in the WebGL tree throws, drop back to the CSS visuals. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    delete document.documentElement.dataset.scene
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * Progressive enhancement: the page is fully usable without this. The 3D
 * layer only mounts when WebGL works, the device isn't very low-end, and the
 * browser has an idle moment after the first paint.
 */
export function SceneHost() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!supportsWebGL() || isLowEndDevice()) return
    const start = () => setEnabled(true)
    // Safari lacks requestIdleCallback
    const idle = window.requestIdleCallback as typeof window.requestIdleCallback | undefined
    if (idle) {
      const handle = idle(start, { timeout: 1500 })
      return () => window.cancelIdleCallback(handle)
    }
    const handle = window.setTimeout(start, 400)
    return () => window.clearTimeout(handle)
  }, [])

  if (!enabled) return null
  return (
    <SceneBoundary>
      <Suspense fallback={null}>
        <SceneLayer />
      </Suspense>
    </SceneBoundary>
  )
}
