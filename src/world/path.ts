import { CatmullRomCurve3, Matrix4, Quaternion, Vector3 } from 'three'
import { events } from '../content/events'
import { experience } from '../content/experience'
import { projects } from '../content/projects'
import type { DetailRef } from '../detail/routes'

/**
 * The geometry of the journey. Every stop the camera makes is a *keyframe*
 * (camera position + look-at target) in real 3D space; the camera flies along
 * a Catmull-Rom spline through them as the visitor scrolls. Content is anchored
 * to keyframes (see layout.tsx), so it genuinely sits at a place in the world.
 *
 * The number of stops is derived from the content, so adding an experience,
 * project or event extends the path automatically.
 */

export type SectionId = 'top' | 'about' | 'experience' | 'projects' | 'events' | 'contact'
export type Theme = 'paper' | 'ink' | 'heat'

export type Keyframe = {
  section: SectionId
  pos: Vector3
  look: Vector3
  /** Background and fog colour while the camera is here. */
  bg: string
  theme: Theme
}

export const SECTION_ORDER: SectionId[] = ['top', 'about', 'experience', 'projects', 'events', 'contact']

const PAPER = '#e8dcd2'
const PAPER_LIGHT = '#eee8e3'
const INK = '#14080f'
const HEAT = '#f2561b'
const PLUM = '#1d0f18'

const v = (x: number, y: number, z: number) => new Vector3(x, y, z)

/** Distance the camera travels past one event's photos: longer galleries get more road. */
export const eventLeg = (photoCount: number) => Math.max(28, 12 + photoCount * 3.4)

function build() {
  const list: Keyframe[] = []
  const push = (section: SectionId, pos: Vector3, look: Vector3, bg: string, theme: Theme) =>
    list.push({ section, pos, look, bg, theme })

  // Hero: the camera starts in front of the name, then flies *between* its two lines.
  push('top', v(0, 0.2, 12), v(0, 0.2, 0), PAPER, 'paper')
  push('about', v(-1.2, 0.3, -14), v(-0.3, 0.2, -26), PAPER_LIGHT, 'paper')

  // Experience: a corridor. One stop per role, alternating sides, deeper each time.
  let z = -38
  experience.forEach((_, j) => {
    const x = j % 2 ? -2.4 : 2.4
    push('experience', v(x, 0.3, z), v(-x * 0.5, 0.2, z - 11), INK, 'ink')
    z -= 9
  })

  z -= 8
  projects.forEach((_, j) => {
    const x = j % 2 ? -2.8 : 2.8
    push('projects', v(x, 0.3, z), v(-x * 0.4, 0.2, z - 12), HEAT, 'heat')
    z -= 12
  })

  z -= 8
  events.forEach((event) => {
    push('events', v(0, 0.3, z), v(0, 0.2, z - 14), PLUM, 'ink')
    z -= eventLeg(event.photos.length)
  })

  z -= 4
  push('contact', v(0, 0.3, z), v(0, 0.3, z - 12), INK, 'ink')
  return list
}

export const keyframes = build()
export const lastKf = keyframes.length - 1

/** First keyframe index owned by each section, and how many it owns. */
export const sectionStart = {} as Record<SectionId, number>
export const sectionOwned = {} as Record<SectionId, number>
SECTION_ORDER.forEach((id) => {
  sectionStart[id] = keyframes.findIndex((k) => k.section === id)
  sectionOwned[id] = keyframes.filter((k) => k.section === id).length
})

/** The camera stop that shows a project or job, so a deep link can put the background world there. */
export const detailKeyframe = ({ kind, id }: DetailRef): number => {
  const list = kind === 'project' ? projects : experience
  return sectionStart[kind === 'project' ? 'projects' : 'experience'] + Math.max(0, list.findIndex((item) => item.id === id))
}

export const posCurve = new CatmullRomCurve3(
  keyframes.map((k) => k.pos),
  false,
  'centripetal',
)
export const lookCurve = new CatmullRomCurve3(
  keyframes.map((k) => k.look),
  false,
  'centripetal',
)

export type Frame = {
  pos: Vector3
  forward: Vector3
  right: Vector3
  up: Vector3
  quaternion: Quaternion
}

const UP = new Vector3(0, 1, 0)
/** Camera basis at each keyframe: where "right", "up" and "toward me" point there. */
export const frames: Frame[] = keyframes.map((k) => {
  const forward = k.look.clone().sub(k.pos).normalize()
  const right = forward.clone().cross(UP).normalize()
  const up = right.clone().cross(forward).normalize()
  const quaternion = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right, up, forward.clone().negate()))
  return { pos: k.pos, forward, right, up, quaternion }
})

/** Camera parameter at keyframe-index `k` (a float). Index-uniform, so integers land exactly on keyframes. */
export const curveT = (k: number) => Math.min(1, Math.max(0, k / lastKf))
