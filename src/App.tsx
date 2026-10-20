import { lazy, Suspense, useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { CursorFollower } from './components/CursorFollower'
import { Header } from './components/Header'
import { Lightbox } from './components/Lightbox'
import { SiteFooter } from './components/SiteFooter'
import { ViewToggle } from './components/ViewToggle'
import { isLowEndDevice, supportsWebGL, usePrefersReducedMotion } from './lib/capabilities'
import { SceneHost } from './scene/SceneHost'
import { Boundary } from './world/boundaries'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Events } from './sections/Events'
import { Experience } from './sections/Experience'
import { Hero } from './sections/Hero'
import { Projects } from './sections/Projects'

// The immersive 3D journey is a separate chunk: the flat page never pays for it.
const WorldExperience = lazy(() => import('./world/WorldExperience').then((m) => ({ default: m.WorldExperience })))

const STORAGE_KEY = 'view-mode'
const readPreference = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'flat'
  } catch {
    return false
  }
}
const writePreference = (flat: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, flat ? 'flat' : 'world')
  } catch {
    // private mode etc.: the choice simply lasts for this visit
  }
}

/**
 * Two renderings of the same content (src/content):
 *  - "world": a camera-driven journey through a 3D scene (default where WebGL works)
 *  - "flat":  the accessible, ordinary scrolling page. Used when WebGL is unavailable,
 *             the device is very low-end, the visitor prefers reduced motion, or the
 *             GPU context is lost mid-session.
 */
export default function App() {
  const reducedMotion = usePrefersReducedMotion()
  const [capable] = useState(() => supportsWebGL() && !isLowEndDevice())
  const [failed, setFailed] = useState(false)
  const [preferFlat, setPreferFlat] = useState(readPreference)
  const world = capable && !reducedMotion && !failed && !preferFlat
  const canOfferWorld = capable && !reducedMotion && !failed

  // leaving the 3D world: let the flat hero show its CSS stand-in until the flat scene mounts
  useEffect(() => {
    if (!world) delete document.documentElement.dataset.scene
  }, [world])

  const toggle = () => {
    writePreference(!preferFlat)
    setPreferFlat(!preferFlat)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    // reducedMotion="user" drops transform animations for visitors who ask for less motion
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      {canOfferWorld ? <ViewToggle mode={world ? 'world' : 'flat'} onToggle={toggle} /> : null}

      {world ? (
        <main id="main" tabIndex={-1} data-mode="world">
          {/* if the chunk fails to load (e.g. a stale tab after a redeploy) drop to the simple page */}
          <Boundary onError={() => setFailed(true)}>
            <Suspense fallback={null}>
              <WorldExperience onFail={() => setFailed(true)} />
            </Suspense>
          </Boundary>
        </main>
      ) : (
        <>
          <SceneHost />
          <CursorFollower />
          <main id="main" tabIndex={-1} data-mode="flat">
            <Hero />
            <About />
            <Experience />
            <Projects />
            <Events />
            <Contact />
          </main>
          <SiteFooter />
          <Lightbox />
        </>
      )}
    </MotionConfig>
  )
}
