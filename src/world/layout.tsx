import { Suspense, useMemo, type ReactNode } from 'react'
import { useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { LayoutContext, MetricsContext, layoutFor, useLayout, useNearKf } from './layoutCore'
import { Boundary } from './boundaries'
import { frames } from './path'

/**
 * Responsive placement. Content is anchored to a keyframe and positioned in that
 * keyframe's *camera frame*: nx / ny are -1..1 across the visible width / height at
 * distance d in front of the camera. The same layout therefore works on a wide
 * monitor and on a phone, while the result is a fixed place in world space that
 * the camera really flies past.
 */

export function LayoutProvider({ lowPower, children }: { lowPower: boolean; children: ReactNode }) {
  const size = useThree((state) => state.size)
  // quantise so tiny resizes don't rebuild every anchor
  const bucket = Math.round((size.width / Math.max(size.height, 1)) * 40) / 40
  const layout = useMemo(() => layoutFor(bucket, lowPower), [bucket, lowPower])
  return <LayoutContext.Provider value={layout}>{children}</LayoutContext.Provider>
}

type Placement = [nx: number, ny: number, d: number]

type AnchorProps = {
  kf: number
  desktop: Placement
  narrow?: Placement
  /** How many keyframes either side the content stays mounted for. */
  range?: number
  children: ReactNode
}

const scratch = new Vector3()

/** A group fixed in world space at (nx, ny, d) in `kf`'s camera frame, oriented to face the camera there. */
export function Anchor({ kf, desktop, narrow, range = 1.8, children }: AnchorProps) {
  const layout = useLayout()
  const near = useNearKf(kf, range)
  const [nx, ny, d] = layout.narrow && narrow ? narrow : desktop
  const frame = frames[kf]

  const { position, metrics } = useMemo(() => {
    const halfH = d * Math.tan((layout.fov * Math.PI) / 360)
    const halfW = halfH * layout.aspect
    scratch
      .copy(frame.pos)
      .addScaledVector(frame.forward, d)
      .addScaledVector(frame.right, nx * halfW)
      .addScaledVector(frame.up, ny * halfH)
    return {
      position: scratch.toArray() as [number, number, number],
      metrics: { visibleW: halfW * 2, visibleH: halfH * 2 },
    }
  }, [frame, d, nx, ny, layout.fov, layout.aspect])

  if (!near) return null
  return (
    <MetricsContext.Provider value={metrics}>
      <group position={position} quaternion={frame.quaternion}>
        {/* own boundary: a texture or font still loading must never blank the rest of the world */}
        <Boundary>
          <Suspense fallback={null}>{children}</Suspense>
        </Boundary>
      </group>
    </MetricsContext.Provider>
  )
}
