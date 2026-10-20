import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useFont } from '@react-three/drei'
import { CanvasTexture } from 'three'
import { FramePause } from '../detail/FramePause'
import { StudioEnvironment } from '../scene/OrbRig'
import { useCoarsePointer } from '../lib/capabilities'
import { Gates, Shards, StarField } from './Backdrop'
import { Atmosphere, CameraRig } from './CameraRig'
import { journey, startJourneyInput } from './journey'
import { LayoutProvider } from './layout'
import { domLayer, useLayout } from './layoutCore'
import { AboutStation, HeroStation } from './stations/Intro'
import { ContactStation, EventsStation } from './stations/Showcase'
import { ExperienceStation, ProjectsStation } from './stations/Work'
import { FONT_URL } from './ui3d'
import './world.css'

useFont.preload(FONT_URL)

/** Holds the world back until the display typeface is parsed, so the hero never pops in half-built. */
function FontGate({ children }: { children: ReactNode }) {
  useFont(FONT_URL)
  return <>{children}</>
}

/**
 * Keeps the canvas at the display's native density for crisp edges, and only gives resolution up if
 * the GPU genuinely cannot keep up. It is deliberately conservative: it learns the display's frame
 * period, needs ~2 s of *sustained* slowness before stepping down, only ever steps down (so it can
 * never oscillate and re-allocate the canvas over and over), and keeps at least 1.5x unless the
 * frame rate is truly poor.
 */
function DprGovernor({ max, onChange }: { max: number; onChange: (dpr: number) => void }) {
  const learn = useRef<number[]>([])
  const period = useRef(0)
  const average = useRef(0)
  const slowFor = useRef(0)
  const current = useRef(max)

  useFrame((_, delta) => {
    if (delta > 0.25) return // tab was in the background
    if (period.current === 0) {
      learn.current.push(delta)
      if (learn.current.length >= 120) {
        const sorted = [...learn.current].sort((a, b) => a - b)
        period.current = Math.min(Math.max(sorted[Math.floor(sorted.length * 0.3)], 0.0075), 0.0175)
        average.current = period.current
      }
      return
    }
    average.current += (delta - average.current) * 0.05
    const floor = average.current > 0.028 ? 1 : 1.5
    if (current.current > floor && average.current > period.current * 1.6) slowFor.current += delta
    else slowFor.current = Math.max(0, slowFor.current - delta)
    if (slowFor.current > 2) {
      slowFor.current = 0
      current.current = Math.max(floor, current.current - 0.25)
      onChange(current.current)
    }
  })

  return null
}

/** A tiny textured plane that keeps the "map + no tone mapping" shader (used by the photo frames) compiled up front. */
function ShaderPrimer() {
  const map = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 2
    return new CanvasTexture(canvas)
  }, [])
  return (
    <mesh position={[0, 0, 200]} scale={0.001}>
      <planeGeometry />
      <meshBasicMaterial map={map} toneMapped={false} />
    </mesh>
  )
}

/**
 * Everything is mounted and visible for the first moments, so this compiles every shader program
 * and uploads every buffer once, while the loader is still covering the screen. Only then does
 * distance culling start and the loader lift. Scrolling afterwards never has to build anything.
 */
function WarmUp({ onDone }: { onDone: () => void }) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      // let the whole tree mount and one frame draw
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      try {
        await Promise.race([gl.compileAsync(scene, camera), new Promise((resolve) => setTimeout(resolve, 5000))])
      } catch {
        // programs simply compile on first use instead
      }
      if (cancelled) return
      journey.cull = true
      document.documentElement.dataset.scene = 'ready'
      onDone()
    })()
    return () => {
      cancelled = true
    }
  }, [gl, scene, camera, onDone])

  return null
}

function Scene({ onWarm }: { onWarm: () => void }) {
  const { lowPower, narrow } = useLayout()
  return (
    <>
      <CameraRig />
      <ShaderPrimer />
      <WarmUp onDone={onWarm} />
      <Atmosphere near={narrow ? 6 : 8} far={narrow ? 38 : 50} />
      <StudioEnvironment />
      <StarField count={lowPower ? 1500 : 3200} />
      <Shards count={lowPower ? 40 : 90} />
      <Gates />
      <HeroStation />
      <AboutStation />
      <ExperienceStation />
      <ProjectsStation />
      <EventsStation />
      <ContactStation />
    </>
  )
}

const setDomLayer = (el: HTMLDivElement | null) => {
  domLayer.el = el
}

export default function World({ onReady, onFail }: { onReady: () => void; onFail: () => void }) {
  const coarse = useCoarsePointer()
  // R3F force-loses the GL context when it unmounts; that must not count as a failure
  const alive = useRef(true)

  // Render at the display's native density (capped at 2x) so edges stay crisp on Retina screens;
  // the governor below only trades resolution away if the GPU genuinely can't keep up.
  const maxDpr = coarse ? 1.5 : Math.min(window.devicePixelRatio || 1, 2)
  const [dpr, setDpr] = useState(maxDpr)

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
        dpr={dpr}
        camera={{ fov: 50, near: 0.1, far: 220, position: [0, 0.2, 12] }}
        gl={{ antialias: !coarse, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: true }}
        onCreated={({ gl }) => {
          // the canvas is decorative for assistive tech; the readable content is the DOM panels in the scene
          gl.domElement.setAttribute('aria-hidden', 'true')
          if (import.meta.env.DEV || new URLSearchParams(window.location.search).has('debug')) {
            ;(window as unknown as { __gl: typeof gl }).__gl = gl
          }
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
            if (alive.current) onFail()
          })
        }}
      >
        <DprGovernor max={maxDpr} onChange={setDpr} />
        <FramePause />
        <LayoutProvider lowPower={coarse}>
          <Suspense fallback={null}>
            <FontGate>
              <Scene onWarm={onReady} />
            </FontGate>
          </Suspense>
        </LayoutProvider>
      </Canvas>
      <div className="world-dom" ref={setDomLayer} />
    </div>
  )
}
