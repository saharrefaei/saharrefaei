import { createContext, useContext, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
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

/**
 * Phone screen zones, in CSS px. On a phone the vertical space is the scarce resource and it varies a lot
 * (an iPhone shows ~660px of page under Safari's toolbars, 844px without), so content is laid out in zones
 * of the *actual* height instead of fractions of it:
 *
 *   0 ─ chrome ─ 64        the site header
 *   64 ─ headline ─ split  the station's 3D headline (company name, project sculpture, ...)
 *   split ─ content ─ H-20 the DOM panel, scaled down if it would not fit
 */
export function phoneZones(height: number) {
  const chrome = 64
  const bottom = 20
  const split = Math.round(Math.min(240, Math.max(150, height * 0.27)))
  return {
    chrome,
    bottom,
    split,
    /** Vertical middle of the headline zone and the room it has, in px. */
    headlineCenter: (chrome + split) / 2,
    headlineHeight: split - chrome - 10,
  }
}

/**
 * Panel box on a narrow (portrait) screen: the CSS width its contents are authored at, and the share of the
 * screen width it takes. A phone gets ~1.1x text at 330px; a portrait tablet gets a wider, calmer column
 * (about 640px on screen) instead of the same copy blown up to twice its size.
 */
export function phoneBox(width: number) {
  return {
    px: Math.round(Math.min(600, Math.max(330, (width * 0.94) / 1.12))),
    frac: Math.min(0.94, 640 / Math.max(width, 1)),
  }
}

/** `px` / `frac` for a Panel: the desktop values, or the phone box on a narrow screen. */
export function usePanelBox(desktopPx: number, desktopFrac: number) {
  const { narrow } = useLayout()
  const width = useThree((state) => state.size.width)
  return narrow ? phoneBox(width) : { px: desktopPx, frac: desktopFrac }
}

/** Camera-frame `ny` (-1..1, +up) of a screen row `y` px from the top. */
export const nyAt = (y: number, height: number) => 1 - (2 * y) / height

/** The phone headline zone of the current screen: where a station's 3D headline goes, and how tall it may be (px). */
export function usePhoneHeadline() {
  const size = useThree((state) => state.size)
  const zones = phoneZones(size.height)
  return { ny: nyAt(zones.headlineCenter, size.height), room: zones.headlineHeight, width: size.width, height: size.height }
}

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
