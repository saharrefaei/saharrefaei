import { useLayoutEffect, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer, MeshDistortMaterial } from '@react-three/drei'
import { MathUtils, Object3D, type Group, type InstancedMesh } from 'three'
import { sceneInput } from '../lib/sceneInput'

const SATELLITES = [
  { radius: 2.55, size: 0.2, speed: 0.55, tilt: 0.5, phase: 0.2, color: '#ff5a1f', iridescent: false },
  { radius: 2.9, size: 0.13, speed: -0.42, tilt: -0.9, phase: 2.2, color: '#ff3d8b', iridescent: false },
  { radius: 2.2, size: 0.1, speed: 0.8, tilt: 1.2, phase: 4.1, color: '#9fe8ff', iridescent: true },
  { radius: 3.15, size: 0.26, speed: 0.3, tilt: 0.15, phase: 3.3, color: '#c21fd8', iridescent: true },
  { radius: 2.7, size: 0.09, speed: -0.7, tilt: 1.7, phase: 5.2, color: '#ffb08a', iridescent: false },
]

const RINGS = [
  { radius: 1.75, tube: 0.085, axis: [1.2, 0, 0.3], spin: 0.32 },
  { radius: 2.1, tube: 0.05, axis: [0.4, 0.2, 1.1], spin: -0.24 },
  { radius: 2.45, tube: 0.034, axis: [-0.7, 0.9, 0.1], spin: 0.18 },
] as const

const damp = MathUtils.damp

/** Lights baked once into the reflection map: nothing is fetched over the network. */
export function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#1a0813']} />
      <Lightformer form="rect" intensity={5} color="#ff5a1f" position={[-5, 2, -1]} scale={[8, 7, 1]} />
      <Lightformer form="rect" intensity={4} color="#ff3d8b" position={[0, 5, -2]} scale={[12, 2.5, 1]} />
      <Lightformer form="rect" intensity={4} color="#c21fd8" position={[5.5, -1, 1]} scale={[4, 9, 1]} />
      <Lightformer form="rect" intensity={7} color="#fff3ea" position={[0, 0.5, 6]} scale={[10, 1.4, 1]} />
      {/* broad soft front panel: head-on faces (the extruded titles) reflect a bright gradient, not black */}
      <Lightformer form="rect" intensity={2.4} color="#ffe9dc" position={[0, 1, 9]} scale={[26, 14, 1]} />
      <Lightformer form="ring" intensity={3} color="#ffb08a" position={[-3, -4, 3]} scale={5} />
      <Lightformer form="rect" intensity={3} color="#ffd6e8" position={[0, -5, -3]} scale={[10, 1.5, 1]} />
    </Environment>
  )
}

function DotHalo({ count, radius }: { count: number; radius: number }) {
  const mesh = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const instanced = mesh.current
    if (!instanced) return
    const dummy = new Object3D()
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      // every 4th dot is bigger: reads like the major ticks of a dial
      const size = i % 4 === 0 ? 1.7 : 0.85
      dummy.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
      dummy.scale.setScalar(size)
      dummy.updateMatrix()
      instanced.setMatrixAt(i, dummy.matrix)
    }
    instanced.instanceMatrix.needsUpdate = true
  }, [count, radius])

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.04, 12, 12]} />
      <meshStandardMaterial color="#ff5a1f" emissive="#ff3d8b" emissiveIntensity={0.9} roughness={0.35} />
    </instancedMesh>
  )
}

type Props = {
  /** Fewer polygons and dots for phones. */
  lowPower: boolean
  /** No idle motion or pointer response. */
  reducedMotion: boolean
  /** Live multiplier for how far the rings and dot halo spread out. */
  spreadRef?: MutableRefObject<number>
}

const STATIC_SPREAD = { current: 1 }

/**
 * The signature object: a distorted gloss core inside three chrome rings, a
 * dotted dial halo and five orbiting satellites. Positioning is up to the
 * parent group; this component only animates the inside of the object.
 */
export function OrbRig({ lowPower, reducedMotion, spreadRef = STATIC_SPREAD }: Props) {
  const tilt = useRef<Group>(null)
  const core = useRef<Group>(null)
  const halo = useRef<Group>(null)
  const ringRefs = useRef<(Group | null)[]>([])
  const orbitRefs = useRef<(Group | null)[]>([])
  const segments = lowPower ? 32 : 64

  useFrame((_, delta) => {
    if (reducedMotion) return
    const dt = Math.min(delta, 0.05)
    const spread = spreadRef.current

    if (tilt.current) {
      tilt.current.rotation.y = damp(tilt.current.rotation.y, sceneInput.pointerX * 0.55, 3, dt)
      tilt.current.rotation.x = damp(tilt.current.rotation.x, -sceneInput.pointerY * 0.38, 3, dt)
    }
    if (core.current) {
      core.current.rotation.y += dt * 0.25
      core.current.scale.setScalar(damp(core.current.scale.x, 1 + Math.abs(sceneInput.pointerX) * 0.06, 4, dt))
    }
    for (let i = 0; i < RINGS.length; i++) {
      const node = ringRefs.current[i]
      if (!node) continue
      node.rotation.x += dt * RINGS[i].spin
      node.rotation.y += dt * RINGS[i].spin * 0.6
      node.scale.setScalar(damp(node.scale.x, spread, 2.2, dt))
    }
    if (halo.current) {
      halo.current.rotation.y += dt * 0.12
      halo.current.scale.setScalar(damp(halo.current.scale.x, spread, 2.2, dt))
    }
    for (let i = 0; i < SATELLITES.length; i++) {
      const node = orbitRefs.current[i]
      if (node) node.rotation.y += dt * SATELLITES[i].speed
    }
  })

  return (
    <group ref={tilt}>
      <group ref={core}>
        <mesh>
          <sphereGeometry args={[1.05, segments, segments]} />
          <MeshDistortMaterial
            color="#ff3d8b"
            emissive="#ff5a1f"
            emissiveIntensity={0.18}
            roughness={0.12}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.05}
            distort={reducedMotion ? 0 : 0.34}
            speed={1.6}
          />
        </mesh>
      </group>

      {RINGS.map((ring, i) => (
        <group
          key={ring.radius}
          ref={(node) => {
            ringRefs.current[i] = node
          }}
          rotation={[ring.axis[0], ring.axis[1], ring.axis[2]]}
        >
          <mesh>
            <torusGeometry args={[ring.radius, ring.tube, 24, segments * 2]} />
            <meshPhysicalMaterial color="#f6eee8" metalness={1} roughness={0.06} envMapIntensity={1.7} />
          </mesh>
        </group>
      ))}

      <group ref={halo} rotation={[0.35, 0, 0.2]}>
        <DotHalo count={lowPower ? 48 : 84} radius={3.35} />
      </group>

      {SATELLITES.map((sat, i) => (
        <group key={sat.color} rotation={[sat.tilt, 0, 0]}>
          <group
            ref={(node) => {
              orbitRefs.current[i] = node
            }}
            rotation={[0, sat.phase, 0]}
          >
            <mesh position={[sat.radius, 0, 0]}>
              <sphereGeometry args={[sat.size, 32, 32]} />
              <meshPhysicalMaterial
                color={sat.color}
                roughness={0.1}
                metalness={sat.iridescent ? 0.6 : 0.15}
                clearcoat={1}
                iridescence={sat.iridescent ? 1 : 0}
                iridescenceIOR={1.6}
                envMapIntensity={1.4}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}
