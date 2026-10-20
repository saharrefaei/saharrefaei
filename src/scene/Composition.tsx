import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, type Group } from 'three'
import { sceneInput } from '../lib/sceneInput'
import { OrbRig, StudioEnvironment } from './OrbRig'
import { desktopPoses, mobilePoses, samplePose, type Pose } from './poses'

type Props = {
  /** Fewer polygons and dots for phones. */
  lowPower: boolean
  /** Phone-sized layout poses. */
  narrow: boolean
  /** Static pose, no idle motion, no scroll/pointer response. */
  reducedMotion: boolean
}

const damp = MathUtils.damp
/** Reused every frame so the render loop allocates nothing. */
const scratchPose: Pose = { x: 0, y: 0, scale: 1, spread: 1, yaw: 0 }

/**
 * FLAT MODE only (reduced motion, or no WebGL camera journey): one decorative
 * object that changes pose as the ordinary HTML page scrolls. The immersive
 * experience lives in src/world.
 */
export function Composition({ lowPower, narrow, reducedMotion }: Props) {
  const root = useRef<Group>(null)
  const spread = useRef(1)
  const placed = useRef(false)
  const poses = narrow ? mobilePoses : desktopPoses

  useFrame(({ viewport }, delta) => {
    const group = root.current
    if (!group) return
    const dt = Math.min(delta, 0.05)

    const pose = reducedMotion ? poses[0] : samplePose(poses, sceneInput.section, scratchPose)
    const fit = Math.min(viewport.width * 0.5, viewport.height * 0.92) / 6
    const targetScale = fit * pose.scale
    const targetX = pose.x * (viewport.width / 2)
    const targetY = pose.y * (viewport.height / 2)

    const snap = reducedMotion || !placed.current
    if (snap) {
      group.position.set(targetX, targetY, 0)
      group.scale.setScalar(targetScale)
    } else {
      group.position.x = damp(group.position.x, targetX, 3.2, dt)
      group.position.y = damp(group.position.y, targetY, 3.2, dt)
      group.scale.setScalar(damp(group.scale.x, targetScale, 3.2, dt))
    }

    if (!reducedMotion) {
      const scrollSpin = sceneInput.scrollY * 0.0011
      group.rotation.y = damp(group.rotation.y, pose.yaw + scrollSpin * 0.35, snap ? 1000 : 2.4, dt)
    }
    spread.current = pose.spread

    if (!placed.current) {
      placed.current = true
      document.documentElement.dataset.scene = 'ready'
    }
  })

  return (
    <>
      <StudioEnvironment />
      <pointLight position={[3, 4, 5]} intensity={18} color="#ffd9c4" />
      <group ref={root}>
        <OrbRig lowPower={lowPower} reducedMotion={reducedMotion} spreadRef={spread} />
      </group>
    </>
  )
}
