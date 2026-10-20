import type { Challenge, GalleryImage, Impact } from '../content/detail'
import { experience } from '../content/experience'
import { projects, type ProjectVisualKind } from '../content/projects'
import { detailSiblings, type DetailRef } from './routes'

/**
 * Projects and jobs have different content but one layout. Each is normalised into this shape,
 * so the view renders sections in order, skips any that are empty, and never needs to know which
 * kind it is showing.
 */
export type Block =
  | { type: 'paragraphs'; items: string[] }
  | { type: 'list'; items: string[] }
  | { type: 'cards'; items: { title: string; body: string; ref?: DetailRef }[] }
  | { type: 'challenges'; items: Challenge[] }
  | { type: 'impact'; impact: Impact }
  | { type: 'gallery'; items: GalleryImage[] }

export type Section = { id: string; heading: string; block: Block }

export type DetailModel = {
  ref: DetailRef
  /** "Project 03 / 09" */
  position: string
  index: number
  title: string
  lede: string
  facts: { label: string; value: string }[]
  current?: boolean
  visual?: { kind: ProjectVisualKind; labels?: readonly string[] }
  sections: Section[]
  tech: { heading: string; items: string[] }
  links: { label: string; href: string; hint: string }[]
  /** The related entry on the other side (a job's projects live in its sections; a project links to its job). */
  related?: { label: string; ref: DetailRef }
  prev: { ref: DetailRef; title: string }
  next: { ref: DetailRef; title: string }
}

const titleOf = (ref: DetailRef) =>
  ref.kind === 'project'
    ? (projects.find((p) => p.id === ref.id)?.title ?? '')
    : (experience.find((e) => e.id === ref.id)?.company ?? '')

function neighbours(ref: DetailRef) {
  const list = detailSiblings(ref.kind)
  const index = list.findIndex((item) => item.id === ref.id)
  const prev = list[(index - 1 + list.length) % list.length]
  const next = list[(index + 1) % list.length]
  return {
    index,
    count: list.length,
    prev: { ref: prev, title: titleOf(prev) },
    next: { ref: next, title: titleOf(next) },
  }
}

/** Keeps only the sections that have something to show. */
const sectionList = (candidates: (Section | false | null | undefined)[]): Section[] =>
  candidates.filter((section): section is Section => Boolean(section))

const pad = (n: number) => String(n).padStart(2, '0')

export function buildModel(ref: DetailRef): DetailModel | null {
  const near = neighbours(ref)

  if (ref.kind === 'project') {
    const project = projects.find((p) => p.id === ref.id)
    if (!project) return null
    const d = project.detail
    const job = d.experienceId ? experience.find((e) => e.id === d.experienceId) : undefined
    return {
      ref,
      position: `Project ${pad(near.index + 1)} / ${pad(near.count)}`,
      index: near.index,
      title: project.title,
      lede: project.description,
      facts: [
        { label: 'Type', value: project.kind },
        ...(project.year ? [{ label: 'Year', value: project.year }] : []),
        ...(d.role ? [{ label: 'My role', value: d.role }] : []),
      ],
      visual: { kind: project.visual, labels: project.visualLabels },
      sections: sectionList([
        d.overview.length > 0 && { id: 'overview', heading: 'Overview', block: { type: 'paragraphs', items: d.overview } },
        d.problem && { id: 'problem', heading: 'The challenge', block: { type: 'paragraphs', items: d.problem } },
        d.responsibilities && { id: 'role', heading: 'Role & responsibilities', block: { type: 'list', items: d.responsibilities } },
        d.architecture && { id: 'architecture', heading: 'Architecture & implementation', block: { type: 'cards', items: d.architecture } },
        d.contributions && { id: 'contributions', heading: 'Key contributions', block: { type: 'list', items: d.contributions } },
        d.challenges && { id: 'challenges', heading: 'Challenges & solutions', block: { type: 'challenges', items: d.challenges } },
        d.impact && { id: 'impact', heading: 'Impact', block: { type: 'impact', impact: d.impact } },
        d.gallery && d.gallery.length > 0 && { id: 'gallery', heading: 'Screenshots', block: { type: 'gallery', items: d.gallery } },
      ]),
      tech: { heading: 'Technologies', items: project.tech },
      links: [
        ...(project.github
          ? [{ label: 'GitHub', href: project.github, hint: `repository for ${project.title}` }]
          : []),
        ...(project.live ? [{ label: 'Live demo', href: project.live, hint: `of ${project.title}` }] : []),
      ],
      related: job ? { label: `Built during my time at ${job.company}`, ref: { kind: 'experience', id: job.id } } : undefined,
      prev: near.prev,
      next: near.next,
    }
  }

  const job = experience.find((e) => e.id === ref.id)
  if (!job) return null
  const d = job.detail
  return {
    ref,
    position: `Experience ${pad(near.index + 1)} / ${pad(near.count)}`,
    index: near.index,
    title: job.company,
    lede: job.role,
    facts: [
      { label: 'Period', value: job.period },
      { label: 'Location', value: job.location },
    ],
    current: job.current,
    sections: sectionList([
      d.overview.length > 0 && { id: 'overview', heading: 'Role overview', block: { type: 'paragraphs', items: d.overview } },
      d.responsibilities.length > 0 && { id: 'responsibilities', heading: 'Main responsibilities', block: { type: 'list', items: d.responsibilities } },
      d.contributions && {
        id: 'contributions',
        heading: 'Projects & contributions',
        block: {
          type: 'cards',
          items: d.contributions.map((c) => ({
            title: c.title,
            body: c.body,
            ref: c.projectId ? { kind: 'project' as const, id: c.projectId } : undefined,
          })),
        },
      },
      d.challenges && { id: 'challenges', heading: 'Engineering challenges & solutions', block: { type: 'challenges', items: d.challenges } },
      d.impact && { id: 'impact', heading: 'Results & achievements', block: { type: 'impact', impact: d.impact } },
    ]),
    tech: { heading: 'Technologies & tools', items: d.tools ?? job.stack },
    links: [],
    prev: near.prev,
    next: near.next,
  }
}
