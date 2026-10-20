import { sceneInput } from '../lib/sceneInput'
import { lastKf, sectionStart, SECTION_ORDER, type SectionId } from './path'

/**
 * Scroll → camera. This is the ONE scroll system of the 3D experience: native page
 * scroll (wheel, trackpad, touch, keyboard, anchors all work) is read once per
 * rendered frame by the camera rig and turned into a float keyframe index.
 * Nothing intercepts or hijacks the scroll; the page simply has tall empty
 * sections that give the scroll bar its length.
 *
 * It is plain mutable state, so scrolling never triggers a React render.
 */
export const journey = {
  /** Keyframe index at the *raw* scroll position (what the visitor is asking for). */
  k: 0,
  /** Smoothed + eased keyframe index the camera is actually at. Drives culling and atmosphere. */
  kE: 0,
  /** Scroll position (px) the camera is currently showing: lags `scrollY` slightly. */
  ySmooth: 0,
  /**
   * False while the world warms up (everything visible so every shader compiles and every
   * buffer uploads once, behind the loader); true afterwards, when distance culling starts.
   */
  cull: false,
  /** Latest camera position, for debugging/verification. */
  cam: { x: 0, y: 0, z: 0 },
}

/**
 * Slowest the camera ever travels, as a fraction of its average speed, at a stop.
 * The camera eases toward each stop (so copy is readable) but never freezes: a dead
 * zone makes the wheel feel unresponsive, then the camera surges when it ends.
 */
const MIN_SPEED = 0.45
const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** Continuous ease: speed goes from MIN_SPEED at each stop up to ~1.5× mid-leg. */
export function easeK(k: number): number {
  const i = Math.min(Math.floor(k), lastKf)
  const f = k - i
  return i + MIN_SPEED * f + (1 - MIN_SPEED) * smoothstep(f)
}

let tops: number[] = []
let starts: number[] = []

/** Scroll position (px) → keyframe index. */
export function kFromY(y: number): number {
  if (starts.length === 0) return 0
  let index = 0
  while (index < starts.length - 1 && y >= tops[index + 1]) index++
  const lastSection = index === starts.length - 1
  const span = Math.max(tops[index + 1] - tops[index], 1)
  const local = Math.min(1, Math.max(0, (y - tops[index]) / span))
  const owned = lastSection ? 0 : starts[index + 1] - starts[index]
  return Math.min(lastKf, starts[index] + local * owned)
}

export function startJourneyInput(): () => void {
  const measure = () => {
    const sections = [...document.querySelectorAll<HTMLElement>('[data-journey-section]')]
    tops = sections.map((el) => el.getBoundingClientRect().top + window.scrollY)
    tops.push(document.documentElement.scrollHeight)
    starts = sections.map((el) => sectionStart[el.dataset.journeySection as SectionId])
  }

  const onPointer = (event: PointerEvent) => {
    // shared with the orb rig's pointer tilt
    sceneInput.pointerX = (event.clientX / window.innerWidth) * 2 - 1
    sceneInput.pointerY = -((event.clientY / window.innerHeight) * 2 - 1)
  }

  measure()
  // land the camera on the stop the initial scroll position (reload, deep link) points at
  journey.ySmooth = window.scrollY
  journey.k = kFromY(window.scrollY)
  journey.kE = easeK(journey.k)
  journey.cull = false

  const resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(document.body)
  window.addEventListener('resize', measure)
  window.addEventListener('pointermove', onPointer, { passive: true })

  return () => {
    resizeObserver.disconnect()
    window.removeEventListener('resize', measure)
    window.removeEventListener('pointermove', onPointer)
  }
}

export { SECTION_ORDER }

// Debug handle (dev builds, or any build opened with ?debug) so the camera can be inspected while profiling.
if (import.meta.env.DEV || new URLSearchParams(window.location.search).has('debug')) {
  ;(window as unknown as { __journey: typeof journey }).__journey = journey
}
