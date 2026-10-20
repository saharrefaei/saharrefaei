import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, RoundedBox } from '@react-three/drei'
import { BufferGeometry, Float32BufferAttribute, type Group, type Mesh } from 'three'
import type { ProjectVisualKind } from '../content/projects'

/**
 * One real 3D model per project, each a small sculpture of what the project is about.
 * They are ~2.4 world units wide at scale 1 and idle-animate in place; the camera does
 * the travelling.
 */

const ORANGE = '#ff5a1f'
const PINK = '#ff3d8b'
const MAGENTA = '#c21fd8'
const CREAM = '#f6eee8'
const INK = '#1a0a12'

function Chrome({ color = CREAM }: { color?: string }) {
  return <meshPhysicalMaterial color={color} metalness={1} roughness={0.1} envMapIntensity={1.8} />
}

function Gloss({ color }: { color: string }) {
  return <meshPhysicalMaterial color={color} roughness={0.12} clearcoat={1} envMapIntensity={1.3} />
}

/** Federated learning: a central server with clients on concentric "depth" shells. */
function Network() {
  const group = useRef<Group>(null)
  const { nodes, lines } = useMemo(() => {
    const shells = [
      { r: 0.8, n: 4, o: 0.3 },
      { r: 1.25, n: 6, o: 0 },
      { r: 1.7, n: 8, o: 0.2 },
    ]
    const points: [number, number, number][] = []
    const segs: number[] = []
    shells.forEach((shell, s) => {
      for (let i = 0; i < shell.n; i++) {
        const a = (i / shell.n) * Math.PI * 2 + shell.o
        const y = Math.sin(i * 1.7 + s) * 0.55
        const p: [number, number, number] = [Math.cos(a) * shell.r, y, Math.sin(a) * shell.r]
        points.push(p)
        segs.push(0, 0, 0, ...p)
      }
    })
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(segs, 3))
    return { nodes: points, lines: geometry }
  }, [])

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.22
  })

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={0.9} />
      </mesh>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={ORANGE} transparent opacity={0.55} />
      </lineSegments>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.1 + (i % 3) * 0.02, 20, 20]} />
          <Gloss color={PINK} />
        </mesh>
      ))}
      {[0.8, 1.25, 1.7].map((r) => (
        <mesh key={r} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.008, 6, 96]} />
          <meshBasicMaterial color={CREAM} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  )
}

/** Generative image app: a living, distorted gloss orb with a chrome ring. */
function Orb() {
  const ring = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (ring.current) {
      ring.current.rotation.x += delta * 0.4
      ring.current.rotation.y += delta * 0.25
    }
  })
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial color={PINK} roughness={0.1} clearcoat={1} distort={0.4} speed={1.8} envMapIntensity={1.4} />
      </mesh>
      <mesh ref={ring} rotation={[1.1, 0.3, 0]}>
        <torusGeometry args={[1.5, 0.045, 24, 128]} />
        <Chrome />
      </mesh>
      <mesh position={[1.6, 0.9, 0.4]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <Gloss color={ORANGE} />
      </mesh>
      <mesh position={[-1.3, -0.9, 0.6]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <Gloss color={MAGENTA} />
      </mesh>
    </group>
  )
}

/** ML pipeline: three stages (train, tune, serve) with data pulses flowing between them. */
function Pipeline() {
  const pulses = useRef<(Mesh | null)[]>([])
  const xs = [-1.5, 0, 1.5]
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    pulses.current.forEach((mesh, i) => {
      if (!mesh) return
      const seg = i % 2
      const p = (t * 0.55 + i * 0.37) % 1
      mesh.position.x = xs[seg] + 0.45 + p * (xs[seg + 1] - xs[seg] - 0.9)
    })
  })
  return (
    <group rotation={[0.25, -0.35, 0]}>
      {xs.map((x, i) => (
        <RoundedBox key={x} args={[0.85, 0.85, 0.85]} radius={0.12} smoothness={4} position={[x, 0, 0]}>
          {i === 1 ? <Gloss color={MAGENTA} /> : <Chrome color={i === 0 ? CREAM : '#ffb08a'} />}
        </RoundedBox>
      ))}
      {[0, 1].map((i) => (
        <mesh key={i} position={[(xs[i] + xs[i + 1]) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.65, 8]} />
          <meshBasicMaterial color={ORANGE} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            pulses.current[i] = m
          }}
        >
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color={PINK} />
        </mesh>
      ))}
    </group>
  )
}

/** Music visualiser: an equaliser of bars. */
function Bars() {
  const bars = useRef<(Mesh | null)[]>([])
  const count = 17
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    bars.current.forEach((mesh, i) => {
      if (!mesh) return
      const h = 0.35 + (0.5 + 0.5 * Math.sin(t * 2.1 + i * 0.7)) * (0.6 + 0.9 * Math.abs(Math.sin(i * 1.3)))
      mesh.scale.y = h
      mesh.position.y = h / 2 - 0.45
    })
  })
  return (
    <group rotation={[0.1, -0.25, 0]}>
      {Array.from({ length: count }, (_, i) => {
        const t = i / (count - 1)
        return (
          <mesh
            key={i}
            position={[(i - (count - 1) / 2) * 0.15, 0, 0]}
            ref={(m) => {
              bars.current[i] = m
            }}
          >
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial
              color={t < 0.5 ? ORANGE : PINK}
              emissive={t < 0.5 ? ORANGE : MAGENTA}
              emissiveIntensity={0.55}
              roughness={0.3}
            />
          </mesh>
        )
      })}
    </group>
  )
}

/** Geo data tool: stacked map layers, the top one lit. */
function Layers() {
  const top = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (top.current) top.current.position.y = 0.7 + Math.sin(clock.elapsedTime * 1.1) * 0.08
  })
  return (
    <group rotation={[0.25, Math.PI / 4, 0]}>
      {[-0.55, 0.05].map((y, i) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[2.1, 0.07, 2.1]} />
          <meshPhysicalMaterial color={i ? '#ffb08a' : CREAM} metalness={1} roughness={0.14} envMapIntensity={1.6} />
        </mesh>
      ))}
      <group ref={top} position={[0, 0.7, 0]}>
        <mesh>
          <boxGeometry args={[2.1, 0.07, 2.1]} />
          <Gloss color={PINK} />
        </mesh>
        {[-0.6, 0, 0.6].map((x) => (
          <mesh key={x} position={[x, 0.06, 0]}>
            <boxGeometry args={[0.05, 0.02, 1.7]} />
            <meshBasicMaterial color={INK} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

const MODELS: Record<ProjectVisualKind, () => React.ReactElement> = {
  network: Network,
  orb: Orb,
  pipeline: Pipeline,
  bars: Bars,
  layers: Layers,
}

export function ProjectModel({ kind }: { kind: ProjectVisualKind }) {
  const Model = MODELS[kind]
  return <Model />
}
