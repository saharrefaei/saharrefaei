import { Suspense, useEffect, useRef, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { useFont } from '@react-three/drei'
import { StudioEnvironment } from '../scene/OrbRig'
import { useCoarsePointer } from '../lib/capabilities'
import { Gates, Shards, StarField } from './Backdrop'
import { Atmosphere, CameraRig } from './CameraRig'
import { startJourneyInput } from './journey'
import { LayoutProvider } from './layout'
import { useLayout } from './layoutCore'
import { AboutStation, HeroStation } from './stations/Intro'
import { ContactStation, EventsStation, InterestsStation } from './stations/Showcase'
import { ExperienceStation, ProjectsStation } from './stations/Work'
import { FONT_URL } from './ui3d'
import './world.css'

useFont.preload(FONT_URL)

/** Holds the world back until the display typeface is parsed, so the hero never pops in half-built. */
function FontGate({ onReady, children }: { onReady: () => void; children: ReactNode }) {
  useFont(FONT_URL)
  useEffect(() => {
    document.documentElement.dataset.scene = 'ready'
    onReady()
  }, [onReady])
  return <>{children}</>
}

function Scene() {
  const { lowPower, narrow } = useLayout()
  return (
    <>
      <CameraRig />
      <Atmosphere near={narrow ? 6 : 8} far={narrow ? 38 : 50} />
      <StudioEnvironment />
      <StarField count={lowPower ? 1500 : 3200} />
      <Shards count={lowPower ? 40 : 90} />
      <Gates />
      <HeroStation />
      <AboutStation />
      <ExperienceStation />
      <ProjectsStation />
      <InterestsStation />
      <EventsStation />
      <ContactStation />
    </>
  )
}

export default function World({ onReady, onFail }: { onReady: () => void; onFail: () => void }) {
  const coarse = useCoarsePointer()
  // R3F force-loses the GL context when it unmounts; that must not count as a failure
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    const stop = startJourneyInput()
    return () => {
      alive.current = false
      stop()
    }
  }, [])

  return (
    <div className="world-layer">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 50, near: 0.1, far: 220, position: [0, 0.2, 12] }}
        gl={{ antialias: !coarse, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: true }}
        onCreated={({ gl }) => {
          // the canvas is decorative for assistive tech; the readable content is the DOM panels in the scene
          gl.domElement.setAttribute('aria-hidden', 'true')
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
            if (alive.current) onFail()
          })
        }}
      >
        <LayoutProvider lowPower={coarse}>
          <Suspense fallback={null}>
            <FontGate onReady={onReady}>
              <Scene />
            </FontGate>
          </Suspense>
        </LayoutProvider>
      </Canvas>
    </div>
  )
}
