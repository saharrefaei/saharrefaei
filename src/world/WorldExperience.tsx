import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Lightbox } from '../components/Lightbox'
import { Boundary } from './boundaries'
import { profile } from '../content/profile'
import { journey } from './journey'
import { SECTION_ORDER, sectionOwned, type SectionId } from './path'
import './world.css'

const World = lazy(() => import('./World'))

/** Scroll length of each section, in viewport heights. Each owned camera stop gets its own stretch of road. */
const SECTION_VH: Record<SectionId, number> = {
  top: 130,
  about: 110,
  experience: sectionOwned.experience * 85,
  projects: sectionOwned.projects * 90,
  interests: sectionOwned.interests * 85,
  events: sectionOwned.events * 100,
  contact: 100,
}

function WorldLoader({ done }: { done: boolean }) {
  return (
    <div className="world-loader" data-done={done} aria-hidden="true">
      <p className="eyebrow">Entering the portfolio…</p>
      <p className="display world-loader__name">
        <span>SAHAR</span>
        <span>REFAEI</span>
      </p>
    </div>
  )
}

/** "Scroll to travel" hint and a thin progress rail with a tick per section. Both are purely visual. */
function WorldChrome() {
  const hint = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const ticks = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const place = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      SECTION_ORDER.forEach((id, i) => {
        const el = document.getElementById(id)
        const tick = ticks.current[i]
        if (el && tick) tick.style.top = `${Math.min(100, (el.offsetTop / max) * 100)}%`
      })
    }
    const onScroll = () => {
      hint.current?.setAttribute('data-hidden', String(window.scrollY > 40))
      rail.current?.style.setProperty('--p', String(journey.progress))
    }
    place()
    onScroll()
    const observer = new ResizeObserver(place)
    observer.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <div className="world-hint" ref={hint} aria-hidden="true">
        <span>Scroll to travel</span>
        <span className="world-hint__arrow">↓</span>
      </div>
      <div className="world-rail" ref={rail} aria-hidden="true">
        <span className="world-rail__line">
          <span className="world-rail__fill" />
        </span>
        {SECTION_ORDER.map((id, i) => (
          <span
            key={id}
            className="world-rail__tick"
            ref={(node) => {
              ticks.current[i] = node
            }}
          />
        ))}
      </div>
    </>
  )
}

/**
 * The immersive mode. One fixed WebGL world holds *all* of the content; the page
 * only provides scroll length (empty, id-bearing sections that double as anchors,
 * so nav links, the back button and keyboard scrolling all behave normally).
 */
export function WorldExperience({ onFail }: { onFail: () => void }) {
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  // The sections only exist once this lazily loaded chunk renders, after the browser has already
  // tried (and failed) to honour a #hash on load. Jump to it now so deep links like /#projects work.
  useLayoutEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
  }, [])

  return (
    <>
      <h1 className="sr-only">
        {profile.name}: {profile.role}, {profile.focus}
      </h1>

      <Boundary onError={onFail}>
        <Suspense fallback={null}>
          <World onReady={onReady} onFail={onFail} />
        </Suspense>
      </Boundary>
      <WorldLoader done={ready} />
      <WorldChrome />

      <div className="journey-track">
        {SECTION_ORDER.map((id) => (
          <div key={id} id={id} className="journey-section" data-journey-section={id} style={{ '--vh': SECTION_VH[id] } as React.CSSProperties} />
        ))}
      </div>

      <Lightbox />
    </>
  )
}
