/**
 * Where the 3D composition sits for each page section, in order:
 * hero · about · experience · projects · interests · contact.
 * x / y are viewport-normalised (-1..1); scale is relative to the viewport fit.
 */
export type Pose = {
  x: number
  y: number
  scale: number
  /** Multiplier for how far the rings and dot halo spread out. */
  spread: number
  /** Extra yaw (radians) so every section shows a different side. */
  yaw: number
}

export const desktopPoses: Pose[] = [
  { x: 0.5, y: 0.34, scale: 0.78, spread: 1, yaw: 0 },
  { x: 0.98, y: 0.45, scale: 0.42, spread: 0.85, yaw: 0.9 },
  { x: 1.0, y: -0.1, scale: 0.46, spread: 1.3, yaw: 1.8 },
  { x: -1.0, y: 0.55, scale: 0.42, spread: 0.9, yaw: 2.7 },
  { x: 0.98, y: -0.6, scale: 0.46, spread: 1.15, yaw: 3.6 },
  { x: 0.72, y: 0.42, scale: 0.62, spread: 1.2, yaw: 4.5 },
]

export const mobilePoses: Pose[] = [
  { x: 0.1, y: 0.5, scale: 0.95, spread: 1, yaw: 0 },
  { x: 0.98, y: 0.78, scale: 0.55, spread: 0.85, yaw: 0.9 },
  { x: -0.98, y: 0.78, scale: 0.55, spread: 1.2, yaw: 1.8 },
  { x: 0.98, y: 0.78, scale: 0.55, spread: 0.9, yaw: 2.7 },
  { x: -0.98, y: 0.78, scale: 0.55, spread: 1.1, yaw: 3.6 },
  { x: 0.6, y: 0.74, scale: 0.7, spread: 1.2, yaw: 4.5 },
]

/** Writes the blended pose into `out` (no allocation) and returns it. */
export function samplePose(poses: Pose[], section: number, out: Pose): Pose {
  const from = Math.min(Math.floor(section), poses.length - 1)
  const to = Math.min(from + 1, poses.length - 1)
  const u = section - from
  const a = poses[from]
  const b = poses[to]
  out.x = a.x + (b.x - a.x) * u
  out.y = a.y + (b.y - a.y) * u
  out.scale = a.scale + (b.scale - a.scale) * u
  out.spread = a.spread + (b.spread - a.spread) * u
  out.yaw = a.yaw + (b.yaw - a.yaw) * u
  return out
}
