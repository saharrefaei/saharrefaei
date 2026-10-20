import { createContext, useContext, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { journey } from './journey'

/** Shared layout state and hooks (components live in layout.tsx). */

export type Layout = {
  aspect: number
  /** Portrait phones and narrow windows. */
  narrow: boolean
  fov: number
  /** Phones/touch: fewer polygons, fewer particles. */
  lowPower: boolean
}

export const LayoutContext = createContext<Layout>({ aspect: 1.6, narrow: false, fov: 50, lowPower: false })
export const useLayout = () => useContext(LayoutContext)

export function layoutFor(aspect: number, lowPower: boolean): Layout {
  const narrow = aspect < 0.9
  return { aspect, narrow, fov: narrow ? 60 : 50, lowPower: lowPower || narrow }
}

/** Width/height of the camera's view at the anchor's distance. */
export const MetricsContext = createContext({ visibleW: 10, visibleH: 6 })
export const useAnchorMetrics = () => useContext(MetricsContext)

/** Whether the surrounding Anchor is currently near the camera (panels use it to hide their DOM). */
export const NearContext = createContext(true)

/** The overlay element that screen-space panels are rendered into (set by World). */
export const domLayer: { el: HTMLElement | null } = { el: null }

/**
 * True while the camera is within `range` keyframes of `kf`. Content stays built and resident and
 * is only shown/hidden by this, so approaching a stop never has to create geometry or compile a
 * shader mid-scroll. While the world warms up (`journey.cull === false`) everything counts as near,
 * which lets every shader compile and every buffer upload once, behind the loader. Pass
 * `warmUp = false` for loading decisions that should not fire during that phase.
 */
export function useNearKf(kf: number, range: number, warmUp = true): boolean {
  const [near, setNear] = useState(() => (warmUp ? true : Math.abs(journey.kE - kf) <= range))
  const nearRef = useRef(near)
  useFrame(() => {
    if (!journey.cull && warmUp) return
    const dist = Math.abs(journey.kE - kf)
    // hysteresis so a stop at the boundary doesn't flicker
    const next = nearRef.current ? dist <= range + 0.25 : dist <= range
    if (next !== nearRef.current) {
      nearRef.current = next
      setNear(next)
    }
  })
  return near
}
