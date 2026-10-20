import { useEffect, useMemo, useRef, useState } from 'react'
import { renderDotGrid } from '../lib/dotFont'
import { usePrefersReducedMotion } from '../lib/capabilities'

type Props = {
  text: string
  /** Accessible name; defaults to `text`. Pass `''` for purely decorative uses. */
  label?: string
  /** Fixed dot pitch in CSS px. Omit to fit the text to its container width. */
  pitch?: number
  /** In fit mode: never draw dots larger than this pitch (short words stay compact). */
  maxPitch?: number
  color?: string
  /** Colour of unlit "LED off" dots. */
  offColor?: string
  /** Colour dots drift toward near the pointer. */
  hoverColor?: string
  /** Dots swell near the pointer. */
  interactive?: boolean
  /** Dots switch on column by column the first time the text scrolls into view. */
  reveal?: boolean
  className?: string
}

type RGB = [number, number, number]

const rgbCache = new Map<string, RGB>()

function parseColor(color: string): RGB {
  const cached = rgbCache.get(color)
  if (cached) return cached
  const hex = color.replace('#', '')
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
  const value: RGB = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as RGB
  rgbCache.set(color, value)
  return value
}

function mix(a: RGB, b: RGB, t: number): string {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
/** Stable pseudo-random per cell so the reveal flickers the same way every time. */
const jitter = (col: number, row: number) => {
  const n = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453
  return n - Math.floor(n)
}

export function DotText({
  text,
  label,
  pitch,
  maxPitch,
  color = '#14080f',
  offColor = 'rgba(20, 8, 15, 0.16)',
  hoverColor = '#ff3d8b',
  interactive = true,
  reveal = true,
  className,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const revealedRef = useRef(false) // survives re-draws (resize, colour changes) so the reveal plays once
  const grid = useMemo(() => renderDotGrid(text), [text])
  const [measuredWidth, setMeasuredWidth] = useState(0)
  const cellPitch = pitch ?? (measuredWidth > 0 ? Math.min(measuredWidth / grid.cols, maxPitch ?? Infinity) : 0)
  const width = Math.ceil(cellPitch * grid.cols)
  const height = Math.ceil(cellPitch * grid.rows)

  // Fit-to-container mode: follow the wrapper width.
  useEffect(() => {
    const wrap = wrapRef.current
    if (pitch || !wrap) return
    const observer = new ResizeObserver(([entry]) => setMeasuredWidth(Math.floor(entry.contentRect.width)))
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [pitch])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas || cellPitch <= 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.ceil(width * dpr)
    canvas.height = Math.ceil(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const on = parseColor(color)
    const hot = parseColor(hoverColor)
    const animated = !reducedMotion
    const state = {
      progress: reveal && animated && !revealedRef.current ? 0 : 1,
      revealing: false,
      px: -9999,
      py: -9999,
      sx: -9999,
      sy: -9999,
      fade: 0,
      pointerInside: false,
    }
    let raf = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const radius = cellPitch * 0.33
      const offRadius = cellPitch * 0.1
      const reach = cellPitch * 3.4

      for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
          const cx = (col + 0.5) * cellPitch
          const cy = (row + 0.5) * cellPitch
          const lit = grid.lit[row * grid.cols + col] === 1

          let influence = 0
          if (state.fade > 0.001) {
            const d = Math.hypot(cx - state.sx, cy - state.sy)
            influence = Math.exp(-((d / reach) ** 2)) * state.fade
          }

          let scale = 1
          if (lit) {
            const delay = (col / grid.cols) * 0.7 + jitter(col, row) * 0.25
            scale = clamp01((state.progress - delay) / 0.2)
          }

          ctx.beginPath()
          if (lit && scale > 0) {
            ctx.fillStyle = mix(on, hot, influence)
            ctx.arc(cx, cy, radius * scale * (1 + 0.85 * influence), 0, Math.PI * 2)
          } else {
            ctx.fillStyle = offColor
            ctx.arc(cx, cy, offRadius * (1 + 2.2 * influence), 0, Math.PI * 2)
          }
          ctx.fill()
        }
      }
    }

    const tick = () => {
      raf = 0
      if (state.revealing && state.progress < 1) state.progress = Math.min(1, state.progress + 0.014)

      state.sx += (state.px - state.sx) * 0.22
      state.sy += (state.py - state.sy) * 0.22
      state.fade += ((state.pointerInside ? 1 : 0) - state.fade) * 0.12

      draw()

      const stillRevealing = state.revealing && state.progress < 1
      const settling = state.pointerInside || state.fade > 0.005
      if (stillRevealing || settling) raf = requestAnimationFrame(tick)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    draw()

    const cleanups: Array<() => void> = []

    if (reveal && animated && !revealedRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          state.revealing = true
          revealedRef.current = true
          schedule()
          observer.disconnect()
        },
        { threshold: 0.35 },
      )
      observer.observe(wrap)
      cleanups.push(() => observer.disconnect())
    }

    if (interactive && animated) {
      const move = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect()
        state.px = event.clientX - rect.left
        state.py = event.clientY - rect.top
        if (!state.pointerInside) {
          state.pointerInside = true
          state.sx = state.px
          state.sy = state.py
        }
        schedule()
      }
      const leave = () => {
        state.pointerInside = false
        schedule()
      }
      wrap.addEventListener('pointermove', move)
      wrap.addEventListener('pointerleave', leave)
      cleanups.push(() => {
        wrap.removeEventListener('pointermove', move)
        wrap.removeEventListener('pointerleave', leave)
      })
    }

    return () => {
      cancelAnimationFrame(raf)
      cleanups.forEach((fn) => fn())
    }
  }, [grid, width, height, cellPitch, color, offColor, hoverColor, interactive, reveal, reducedMotion])

  const accessibleName = label ?? text

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ width: pitch ? width : '100%', height: height || undefined, lineHeight: 0 }}
      role={accessibleName ? 'img' : undefined}
      aria-label={accessibleName || undefined}
      aria-hidden={accessibleName ? undefined : true}
    >
      <canvas ref={canvasRef} aria-hidden="true" style={{ width, height }} />
    </div>
  )
}
