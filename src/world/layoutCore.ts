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

/** Mounts children only while the camera is near this keyframe: cheap culling and no off-screen DOM. */
export function useNearKf(kf: number, range: number): boolean {
  const [near, setNear] = useState(() => Math.abs(journey.kE - kf) <= range)
  const nearRef = useRef(near)
  useFrame(() => {
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
