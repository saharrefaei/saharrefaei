import { useLayoutEffect, useRef, type ReactNode, type Ref } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text3D } from '@react-three/drei'
import { Vector3, type Group, type Mesh, type MeshBasicMaterial } from 'three'
import { useAnchorMetrics } from './layoutCore'
import type { Theme } from './path'
import './panel.css'

const scratch = new Vector3()
const direction = new Vector3()
const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

export const FONT_URL = '/fonts/bricolage-800-cond.typeface.json'

export type TitleLook = 'chrome' | 'ink' | 'heat' | 'ghost' | 'ghostInk'

const GHOST_OPACITY = { ghost: 0.1, ghostInk: 0.09 } as const

function TitleMaterial({ look, ghostRef }: { look: TitleLook; ghostRef: Ref<MeshBasicMaterial> }) {
  switch (look) {
    case 'chrome':
      return <meshPhysicalMaterial color="#fbf4ee" metalness={1} roughness={0.1} envMapIntensity={1.9} />
    case 'ink':
      return <meshPhysicalMaterial color="#1a0a12" metalness={0.85} roughness={0.18} envMapIntensity={1.6} />
    case 'heat':
      return (
        <meshPhysicalMaterial
          color="#ff3d8b"
          metalness={0.5}
          roughness={0.2}
          clearcoat={1}
          emissive="#ff5a1f"
          emissiveIntensity={0.18}
          envMapIntensity={1.4}
        />
      )
    case 'ghost':
      return <meshBasicMaterial ref={ghostRef} color="#ffffff" transparent opacity={0.1} depthWrite={false} />
    case 'ghostInk':
      return <meshBasicMaterial ref={ghostRef} color="#14080f" transparent opacity={0.09} depthWrite={false} />
  }
}

type TitleProps = {
  text: string
  /** Em size in world units (cap height is about 0.7 of this). */
  size: number
  look?: TitleLook
  align?: 'center' | 'left'
  /** Shrink to fit if the text would be wider than this (world units). */
  maxWidth?: number
  /** Extrusion depth in world units. */
  depth?: number
}

/** Extruded 3D lettering, measured once and aligned so it can be dropped anywhere in the scene. */
export function Title3D({ text, size, look = 'chrome', align = 'center', maxWidth, depth = 0.45 }: TitleProps) {
  const group = useRef<Group>(null)
  const mesh = useRef<Mesh>(null)
  const ghostMaterial = useRef<MeshBasicMaterial>(null)

  // Ghost lettering is a backdrop: it fades out as the camera nears it, so flying
  // through a giant word never fills the screen with a grey slab.
  useFrame(({ camera }) => {
    const material = ghostMaterial.current
    const g = group.current
    if (!material || !g || (look !== 'ghost' && look !== 'ghostInk')) return
    const distance = g.getWorldPosition(scratch).distanceTo(camera.position)
    material.opacity = GHOST_OPACITY[look] * smooth((distance - 6) / 16)
  })

  useLayoutEffect(() => {
    const m = mesh.current
    const g = group.current
    if (!m || !g) return
    m.geometry.computeBoundingBox()
    const box = m.geometry.boundingBox
    if (!box) return
    const width = box.max.x - box.min.x
    g.scale.setScalar(maxWidth && width > maxWidth ? maxWidth / width : 1)
    m.position.set(align === 'center' ? -(box.min.x + box.max.x) / 2 : -box.min.x, -(box.min.y + box.max.y) / 2, -depth / 2)
  }, [text, size, maxWidth, align, depth])

  return (
    <group ref={group}>
      <Text3D
        ref={mesh}
        font={FONT_URL}
        size={size}
        height={depth}
        curveSegments={7}
        bevelEnabled
        bevelThickness={size * 0.018}
        bevelSize={size * 0.012}
        bevelSegments={2}
        letterSpacing={-size * 0.012}
      >
        {text}
        <TitleMaterial look={look} ghostRef={ghostMaterial} />
      </Text3D>
    </group>
  )
}

type PanelProps = {
  /** CSS width of the panel contents, in px. Text sizes are authored against this. */
  px: number
  /** Width of the panel as a fraction of the visible screen width at its distance. */
  frac: number
  theme: Theme
  className?: string
  children: ReactNode
}

/**
 * Real DOM positioned in real 3D space: a drei <Html transform> shares the WebGL
 * camera's matrices, so the panel gets true perspective, foreshortening and
 * parallax while staying selectable, readable by screen readers and clickable.
 * It fades out as the camera sweeps past it or when it is far away, and while
 * invisible it is `visibility: hidden`, which also removes its links from the tab order.
 */
export function Panel({ px, frac, theme, className, children }: PanelProps) {
  const { visibleW } = useAnchorMetrics()
  const distanceFactor = (400 * frac * visibleW) / px
  const group = useRef<Group>(null)
  const node = useRef<HTMLDivElement>(null)

  useFrame(({ camera }) => {
    const g = group.current
    const el = node.current
    if (!g || !el) return
    g.getWorldPosition(scratch).sub(camera.position)
    camera.getWorldDirection(direction)
    const depth = scratch.dot(direction)
    const opacity = smooth((depth - 2.4) / 3) * (1 - smooth((depth - 15) / 8))
    el.style.opacity = opacity.toFixed(3)
    el.style.visibility = opacity < 0.03 ? 'hidden' : 'visible'
    el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none'
  })

  return (
    <group ref={group}>
      <Html transform center distanceFactor={distanceFactor} pointerEvents="none" zIndexRange={[20, 0]}>
        <div ref={node} className={`wp wp--${theme}${className ? ` ${className}` : ''}`} style={{ width: px }}>
          {children}
        </div>
      </Html>
    </group>
  )
}
