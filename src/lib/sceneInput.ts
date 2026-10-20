/**
 * Plain mutable input for the WebGL scene (read every frame, so it must not
 * live in React state): where the viewport is among the page sections, the
 * raw scroll distance and the normalised pointer position.
 */
export const sceneInput = {
  /** Float section index, e.g. 1.4 = 40% of the way from section 1 to section 2. */
  section: 0,
  scrollY: 0,
  /** -1..1, origin at viewport centre, +y up. */
  pointerX: 0,
  pointerY: 0,
}

const SECTION_SELECTOR = '[data-scene-section]'
const smoothstep = (t: number) => t * t * (3 - 2 * t)

export function startSceneInput(): () => void {
  let tops: number[] = []

  const measure = () => {
    tops = [...document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)].map(
      (el) => el.getBoundingClientRect().top + window.scrollY,
    )
    tops.push(document.documentElement.scrollHeight)
    update()
  }

  const update = () => {
    sceneInput.scrollY = window.scrollY
    if (tops.length < 2) return
    const probe = window.scrollY + window.innerHeight * 0.5
    let index = 0
    while (index < tops.length - 2 && probe >= tops[index + 1]) index++
    const progress = (probe - tops[index]) / Math.max(tops[index + 1] - tops[index], 1)
    // Hold the pose for the first part of a section, then ease to the next one.
    const handoff = smoothstep(Math.min(1, Math.max(0, (progress - 0.55) / 0.45)))
    sceneInput.section = Math.min(index + handoff, tops.length - 2)
  }

  const onPointer = (event: PointerEvent) => {
    sceneInput.pointerX = (event.clientX / window.innerWidth) * 2 - 1
    sceneInput.pointerY = -((event.clientY / window.innerHeight) * 2 - 1)
  }

  measure()
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
