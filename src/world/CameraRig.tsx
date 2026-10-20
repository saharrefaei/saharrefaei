import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MathUtils, Vector3, type Fog, type PerspectiveCamera, type PointLight } from 'three'
import { sceneInput } from '../lib/sceneInput'
import { easeK, journey, kFromY } from './journey'
import { useLayout } from './layoutCore'
import { curveT, keyframes, lastKf, lookCurve, posCurve } from './path'

const damp = MathUtils.damp
const pos = new Vector3()
const look = new Vector3()
const right = new Vector3()
const up = new Vector3()

/**
 * THE CAMERA. A PerspectiveCamera that travels along a spline through the world,
 * driven by scroll. Everything happens inside the render loop, so the camera is
 * always in step with the frame being drawn:
 *
 *   window.scrollY (read this frame) → frame-rate-independent smoothing in scroll space
 *     → keyframe index → stop easing → spline parameter t → position + look-at target
 *
 * A small pointer parallax is layered on top, so the world responds to the
 * mouse without ever fighting the scroll.
 */
export function CameraRig() {
  const layout = useLayout()
  const px = useRef(0)
  const py = useRef(0)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const camera = state.camera as PerspectiveCamera
    if (camera.fov !== layout.fov) {
      camera.fov = layout.fov
      camera.updateProjectionMatrix()
    }

    // Smoothing happens in scroll space: exponential (so it is frame-rate independent) and
    // memoryless (so reversing direction responds instantly, with no momentum to unwind).
    // The rate rises with the gap, so a quick flick is tracked tightly instead of lagging
    // behind, while gentle scrolling stays silky.
    const y = window.scrollY
    const gap = y - journey.ySmooth
    const rate = 15 + Math.min(30, (Math.abs(gap) / (window.innerHeight * 0.5)) * 30)
    journey.ySmooth += gap * (1 - Math.exp(-rate * dt))
    if (Math.abs(y - journey.ySmooth) < 0.05) journey.ySmooth = y

    journey.k = kFromY(y)
    journey.kE = easeK(kFromY(journey.ySmooth))

    const t = curveT(journey.kE)
    posCurve.getPoint(t, pos)
    lookCurve.getPoint(t, look)

    px.current = damp(px.current, sceneInput.pointerX, 3, dt)
    py.current = damp(py.current, sceneInput.pointerY, 3, dt)
    camera.matrixWorld.extractBasis(right, up, scratchZ)
    pos.addScaledVector(right, px.current * 0.45).addScaledVector(up, py.current * 0.28)
    look.addScaledVector(right, px.current * 0.9).addScaledVector(up, py.current * 0.5)

    camera.position.copy(pos)
    camera.lookAt(look)
    camera.updateMatrixWorld()

    journey.cam.x = pos.x
    journey.cam.y = pos.y
    journey.cam.z = pos.z
  })

  return null
}

const scratchZ = new Vector3()
const bgColors = keyframes.map((k) => new Color(k.bg))
const mixed = new Color()

/** Background + fog colour follow the journey, so the world itself changes mood from section to section. */
export function Atmosphere({ near, far }: { near: number; far: number }) {
  const bg = useRef<Color>(null)
  const fog = useRef<Fog>(null)
  const light = useRef<PointLight>(null)

  useFrame(({ camera }) => {
    const i = Math.min(Math.floor(journey.kE), lastKf)
    const j = Math.min(i + 1, lastKf)
    mixed.copy(bgColors[i]).lerp(bgColors[j], journey.kE - i)
    bg.current?.copy(mixed)
    fog.current?.color.copy(mixed)
    // a soft key light rides along with the camera
    light.current?.position.copy(camera.position).add(scratchZ.set(2, 3, 2))
  })

  return (
    <>
      <color ref={bg} attach="background" args={[keyframes[0].bg]} />
      <fog ref={fog} attach="fog" args={[keyframes[0].bg, near, far]} />
      <ambientLight intensity={0.55} />
      <pointLight ref={light} intensity={60} distance={45} decay={1.6} color="#ffd9c4" />
    </>
  )
}
