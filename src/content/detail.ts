/**
 * Shared shapes for the content of the detail views (see src/detail). Every field is optional unless
 * it is the minimum a view needs: a section with no data is simply not rendered, so a thin entry
 * stays honest instead of being padded out.
 */

/** A verified, measurable result. Only add one when the number can be backed up. */
export type Metric = {
  value: string
  label: string
  note?: string
}

/** Outcomes: hard numbers (verified only) and/or plain statements of what changed. */
export type Impact = {
  metrics?: Metric[]
  notes?: string[]
}

export type Challenge = {
  challenge: string
  solution: string
}

export type GalleryImage = {
  /** Path under /public (e.g. /projects/foo/1.jpg). Only real screenshots or photos. */
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
}
