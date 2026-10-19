import { sceneInput } from '../lib/sceneInput'
import { lastKf, sectionStart, SECTION_ORDER, type SectionId } from './path'

/**
 * Scroll → camera. This is the ONE scroll system of the 3D experience:
 * native page scroll (wheel, trackpad, touch, keyboard, anchors all work) is
 * turned into a float keyframe index `k`. Nothing intercepts or hijacks the
 * scroll; the page simply has tall empty sections that give the scroll bar its
 * length.
 *
 * It is plain mutable state, read every frame by the camera rig, so scrolling
 * never triggers a React render.
 */
export const journey = {
  /** Raw target keyframe index from scroll position. */
  k: 0,
  /** Smoothed, eased keyframe index that the camera is actually at. */
  kE: 0,
  /** 0..1 over the whole journey, for progress UI. */
  progress: 0,
  /** Latest camera position, for debugging/verification. */
  cam: { x: 0, y: 0, z: 0 },
}

/** Fraction of each leg spent holding still at the stops (per side). Travel happens in the middle. */
const HOLD = 0.25
const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** Dwell at each stop so copy is readable, then glide to the next one. */
export function easeK(k: number): number {
  const i = Math.min(Math.floor(k), lastKf)
  const f = k - i
  const t = Math.min(1, Math.max(0, (f - HOLD) / (1 - 2 * HOLD)))
  return i + smoothstep(t)
}

export function startJourneyInput(): () => void {
  let tops: number[] = []
  let starts: number[] = []

  const measure = () => {
    const sections = [...document.querySelectorAll<HTMLElement>('[data-journey-section]')]
    tops = sections.map((el) => el.getBoundingClientRect().top + window.scrollY)
    tops.push(document.documentElement.scrollHeight)
    starts = sections.map((el) => sectionStart[el.dataset.journeySection as SectionId])
    update()
  }

  const update = () => {
    if (starts.length === 0) return
    const y = window.scrollY
    let index = 0
    while (index < starts.length - 1 && y >= tops[index + 1]) index++
    const lastSection = index === starts.length - 1
    const span = Math.max(tops[index + 1] - tops[index], 1)
    const local = Math.min(1, Math.max(0, (y - tops[index]) / span))
    const owned = lastSection ? 0 : starts[index + 1] - starts[index]
    journey.k = Math.min(lastKf, starts[index] + local * owned)
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
    journey.progress = Math.min(1, Math.max(0, y / max))
  }

  const onPointer = (event: PointerEvent) => {
    // shared with the orb rig's pointer tilt
    sceneInput.pointerX = (event.clientX / window.innerWidth) * 2 - 1
    sceneInput.pointerY = -((event.clientY / window.innerHeight) * 2 - 1)
  }

  measure()
  // land the camera on the stop that the initial scroll position (reload, deep link) points at
  journey.kE = easeK(journey.k)
  const resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(document.body)
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', measure)
  window.addEventListener('pointermove', onPointer, { passive: true })

  return () => {
    resizeObserver.disconnect()
    window.removeEventListener('scroll', update)
    window.removeEventListener('resize', measure)
    window.removeEventListener('pointermove', onPointer)
  }
}

export { SECTION_ORDER }

// Dev-only handle so the camera's world position can be inspected while testing.
if (import.meta.env.DEV) (window as unknown as { __journey: typeof journey }).__journey = journey
