import { experience } from '../content/experience'
import { projects } from '../content/projects'

export type DetailKind = 'project' | 'experience'
export type DetailRef = { kind: DetailKind; id: string }

/** URL segment per kind: /projects/<id> and /experience/<id>. */
const SEGMENT: Record<DetailKind, string> = { project: 'projects', experience: 'experience' }

export const detailExists = ({ kind, id }: DetailRef) =>
  (kind === 'project' ? projects : experience).some((item) => item.id === id)

export const detailPath = (ref: DetailRef) => `/${SEGMENT[ref.kind]}/${ref.id}`

/** `/projects/federated-vit` → a ref, or null when the path is not (a known) detail view. */
export function parseDetailPath(pathname: string): DetailRef | null {
  const [segment, rawId, ...rest] = pathname.split('/').filter(Boolean)
  if (!segment || !rawId || rest.length > 0) return null
  const kind = (Object.keys(SEGMENT) as DetailKind[]).find((k) => SEGMENT[k] === segment)
  if (!kind) return null
  let id: string
  try {
    id = decodeURIComponent(rawId)
  } catch {
    return null // e.g. /projects/% : not a view, never a crash
  }
  const ref = { kind, id }
  return detailExists(ref) ? ref : null
}

/** The ordered list a ref belongs to, for previous / next navigation. */
export const detailSiblings = (kind: DetailKind): DetailRef[] =>
  (kind === 'project' ? projects : experience).map((item) => ({ kind, id: item.id }))
