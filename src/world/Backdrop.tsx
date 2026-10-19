import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Color, DoubleSide, Object3D, Vector3, type InstancedMesh } from 'three'
import { lastKf, curveT, posCurve } from './path'

/**
 * The things that make travel *visible*: without reference points a moving camera
 * in an empty scene just looks like a static image. These give constant depth cues.
 *  - a star field of dots scattered through the whole volume the camera travels through
 *  - hoops the camera physically flies through between stops
 *  - floating chrome shards that slide past at different distances
 */

const PALETTE = ['#ff5a1f', '#ff3d8b', '#c21fd8', '#ffb08a', '#ff7a45']

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function circleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.55, 'rgba(255,255,255,0.95)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new CanvasTexture(canvas)
}

export function StarField({ count }: { count: number }) {
  const { positions, colors } = useMemo(() => {
    const rand = seeded(7)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const tmp = new Vector3()
    const color = new Color()
    for (let i = 0; i < count; i++) {
      posCurve.getPoint(rand(), tmp)
      const angle = rand() * Math.PI * 2
      const radius = 2.3 + Math.pow(rand(), 1.7) * 15
      positions[i * 3] = tmp.x + Math.cos(angle) * radius
      positions[i * 3 + 1] = tmp.y + Math.sin(angle) * radius * 0.62
      positions[i * 3 + 2] = tmp.z + (rand() - 0.5) * 9
      color.set(PALETTE[Math.floor(rand() * PALETTE.length)])
      colors.set([color.r, color.g, color.b], i * 3)
    }
    return { positions, colors }
  }, [count])
  const map = useMemo(() => circleTexture(), [])

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.2} sizeAttenuation vertexColors map={map} transparent alphaTest={0.02} depthWrite={false} />
    </points>
  )
}

/** Hoops centred on the camera path at the mid-point of every leg, oriented along it. */
export function Gates() {
  const gates = useMemo(() => {
    const list: { position: [number, number, number]; quaternion: [number, number, number, number]; color: string; radius: number }[] = []
    const point = new Vector3()
    const tangent = new Vector3()
    const dummy = new Object3D()
    for (let i = 0; i < lastKf; i++) {
      const t = curveT(i + 0.5)
      posCurve.getPoint(t, point)
      posCurve.getTangent(t, tangent)
      dummy.position.copy(point)
      dummy.lookAt(point.clone().add(tangent))
      const q = dummy.quaternion
      list.push({
        position: point.toArray() as [number, number, number],
        quaternion: [q.x, q.y, q.z, q.w],
        color: PALETTE[i % PALETTE.length],
        radius: 3.4 + (i % 3) * 0.5,
      })
    }
    return list
  }, [])

  return (
    <>
      {gates.map((gate, i) => (
        <group key={i} position={gate.position} quaternion={gate.quaternion}>
          <mesh>
            <torusGeometry args={[gate.radius, 0.05, 8, 96]} />
            <meshBasicMaterial color={gate.color} />
          </mesh>
          <mesh scale={1.45}>
            <torusGeometry args={[gate.radius, 0.022, 6, 96]} />
            <meshBasicMaterial color={gate.color} transparent opacity={0.55} />
          </mesh>
          <mesh scale={2.1}>
            <torusGeometry args={[gate.radius, 0.014, 6, 96]} />
            <meshBasicMaterial color={gate.color} transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
    </>
  )
}

export function Shards({ count }: { count: number }) {
  const mesh = useRef<InstancedMesh>(null)
  const data = useMemo(() => {
    const rand = seeded(21)
    const tmp = new Vector3()
    return Array.from({ length: count }, () => {
      posCurve.getPoint(rand(), tmp)
      const angle = rand() * Math.PI * 2
      const radius = 4 + rand() * 10
      return {
        x: tmp.x + Math.cos(angle) * radius,
        y: tmp.y + Math.sin(angle) * radius * 0.6,
        z: tmp.z + (rand() - 0.5) * 8,
        s: 0.18 + rand() * 0.55,
        rx: rand() * 6,
        ry: rand() * 6,
        sx: (rand() - 0.5) * 0.6,
        sy: (rand() - 0.5) * 0.6,
      }
    })
  }, [count])
  const dummy = useMemo(() => new Object3D(), [])

  useLayoutEffect(() => {
    const instanced = mesh.current
    if (!instanced) return
    const color = new Color()
    for (let i = 0; i < data.length; i++) {
      color.set(i % 4 === 0 ? '#fbf4ee' : PALETTE[i % PALETTE.length])
      instanced.setColorAt(i, color)
    }
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true
  }, [data])

  useFrame(({ clock }) => {
    const instanced = mesh.current
    if (!instanced) return
    const t = clock.elapsedTime
    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      dummy.position.set(d.x, d.y + Math.sin(t * 0.5 + i) * 0.15, d.z)
      dummy.rotation.set(d.rx + t * d.sx, d.ry + t * d.sy, 0)
      dummy.scale.setScalar(d.s)
      dummy.updateMatrix()
      instanced.setMatrixAt(i, dummy.matrix)
    }
    instanced.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial metalness={0.9} roughness={0.14} envMapIntensity={1.6} side={DoubleSide} />
    </instancedMesh>
  )
}

