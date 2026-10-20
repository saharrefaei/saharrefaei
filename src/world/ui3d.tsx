import { useContext, useLayoutEffect, useRef, type ReactNode, type Ref } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useFrame } from '@react-three/fiber'
import { Text3D } from '@react-three/drei'
import { Vector3, type Group, type Mesh, type MeshBasicMaterial, type PerspectiveCamera } from 'three'
import { domLayer, NearContext, useAnchorMetrics } from './layoutCore'
import type { Theme } from './path'
import './panel.css'

const scratch = new Vector3()
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

type PanelState = { el: HTMLDivElement | null; root: Root | null; height: number; transform: string; opacity: number; zIndex: string; shown: boolean }

const ndc = new Vector3()
const viewPos = new Vector3()
const SCALE_STEPS = 96

/**
 * Real DOM positioned by the 3D scene. Each frame the panel's anchor point is projected through
 * the WebGL camera, so it sits at a true place in the world, scales with distance and moves with
 * parallax. It stays selectable, clickable and readable by screen readers.
 *
 * Why not CSS 3D transforms (drei <Html transform>)? Text inside a matrix3d + perspective layer is
 * rasterised, then resampled at a fractional scale and offset, which measurably softens it (it
 * scored 76-100% of flat-text sharpness in testing). Here the transform is only
 * `translate3d(x, y) scale(s)`, with x/y snapped to whole *device* pixels and s quantised, so the
 * browser rasterises the text natively at its final size: always crisp, also while the camera moves.
 */
export function Panel({ px, frac, theme, className, children }: PanelProps) {
  const { visibleW } = useAnchorMetrics()
  const near = useContext(NearContext)
  const group = useRef<Group>(null)
  const state = useRef<PanelState>({ el: null, root: null, height: 0, transform: '', opacity: -1, zIndex: '', shown: false })
  const worldWidth = frac * visibleW

  useLayoutEffect(() => {
    const layer = domLayer.el
    if (!layer) return
    const el = document.createElement('div')
    el.className = `wp wp--${theme}${className ? ` ${className}` : ''}`
    el.style.cssText = `position:absolute;left:0;top:0;width:${px}px;transform-origin:0 0;display:none;`
    layer.appendChild(el)
    const root = createRoot(el)
    const s = state.current
    Object.assign(s, { el, root, height: 0, transform: '', opacity: -1, zIndex: '', shown: false })
    const observer = new ResizeObserver(() => {
      s.height = el.offsetHeight
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      s.el = null
      s.root = null
      el.remove()
      queueMicrotask(() => root.unmount())
    }
  }, [px, theme, className])

  useLayoutEffect(() => {
    state.current.root?.render(children)
  })

  useFrame(({ camera, size }) => {
    const s = state.current
    const el = s.el
    const g = group.current
    if (!el || !g) return

    const hide = () => {
      if (s.shown) {
        el.style.display = 'none'
        s.shown = false
      }
    }
    if (!near) return hide()

    g.getWorldPosition(ndc)
    const depth = -viewPos.copy(ndc).applyMatrix4(camera.matrixWorldInverse).z
    // fade in as the camera approaches, out as it sweeps past or the panel is far away
    const opacity = smooth((depth - 2.4) / 3) * (1 - smooth((depth - 15) / 8))
    if (depth < 0.5 || opacity < 0.02) return hide()

    ndc.project(camera)
    const sx = (ndc.x * 0.5 + 0.5) * size.width
    const sy = (-ndc.y * 0.5 + 0.5) * size.height
    const fov = ((camera as PerspectiveCamera).fov * Math.PI) / 180
    const pxPerUnit = size.height / (2 * Math.tan(fov / 2) * depth)
    const scale = Math.round(((worldWidth * pxPerUnit) / px) * SCALE_STEPS) / SCALE_STEPS
    const height = s.height || el.offsetHeight
    const dpr = window.devicePixelRatio || 1
    const x = Math.round((sx - (px * scale) / 2) * dpr) / dpr
    const y = Math.round((sy - (height * scale) / 2) * dpr) / dpr

    if (!s.shown) {
      el.style.display = 'block'
      s.shown = true
    }
    const transform = `translate3d(${x}px,${y}px,0) scale(${scale})`
    if (transform !== s.transform) {
      s.transform = transform
      el.style.transform = transform
    }
    const o = Math.round(opacity * 50) / 50
    if (o !== s.opacity) {
      s.opacity = o
      el.style.opacity = String(o)
      el.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
    }
    const z = String(Math.round(5000 - depth * 20))
    if (z !== s.zIndex) {
      s.zIndex = z
      el.style.zIndex = z
    }
  })

  return <group ref={group} />
}
