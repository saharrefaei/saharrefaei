export type EventPhoto = {
  /** Path under /public (e.g. "/events/my-photo.jpg") or a full URL. */
  src: string
  alt: string
  caption?: string
  /** `true` while this is a placeholder. Shows a "Sample photo" badge. Delete the flag for real photos. */
  sample?: boolean
}

export type CommunityEvent = {
  id: string
  title: string
  /** Short label, also drawn as the big 3D title: "Hackathon", "Meetup", "Talk"... */
  kind: string
  /** Your role. Keep it factual. */
  role: string
  date?: string
  location?: string
  description: string
  /** `true` only for events you really took part in. `false` shows a "Sample event" badge. */
  verified: boolean
  photos: EventPhoto[]
}

/**
 * HOW TO USE YOUR OWN PHOTOS
 * 1. Copy your images into `public/events/` (JPG/WebP, ~1600px on the long side keeps the 3D scene light).
 * 2. Replace the `src`, `alt` and `caption` of each photo below and delete `sample: true`.
 * 3. Add more photos or events by copying an entry. Each event becomes one stop on the 3D journey.
 * 4. Delete the two "Sample event" entries when you have real ones.
 *
 * Nothing else needs to change: the 3D gallery, the fullscreen viewer and the flat fallback all read this list.
 */
export const events: CommunityEvent[] = [
  {
    id: 'claude-taxfix-hackathon',
    title: 'Claude × Taxfix Hackathon',
    kind: 'Hackathon',
    role: 'Helped organize',
    location: 'Berlin, Germany',
    description:
      'A hackathon in Berlin, the Claude × Taxfix Hackathon. I helped organize it.',
    verified: true,
    photos: [
      { src: '/events/sample-hackathon-1.jpg', alt: 'Sample placeholder image for the hackathon gallery', sample: true },
      { src: '/events/sample-hackathon-2.jpg', alt: 'Sample placeholder image for the hackathon gallery', sample: true },
      { src: '/events/sample-hackathon-3.jpg', alt: 'Sample placeholder image for the hackathon gallery', sample: true },
    ],
  },
  {
    id: 'sample-community',
    title: 'Sample event · community meetup',
    kind: 'Meetup',
    role: 'Your role here',
    description: 'Placeholder collection that shows how a second event looks. Replace it with a real event or delete this entry.',
    verified: false,
    photos: [
      { src: '/events/sample-community-1.jpg', alt: 'Sample placeholder image', caption: 'Sample photo', sample: true },
      { src: '/events/sample-community-2.jpg', alt: 'Sample placeholder image', caption: 'Sample photo', sample: true },
      { src: '/events/sample-community-3.jpg', alt: 'Sample placeholder image', caption: 'Sample photo', sample: true },
    ],
  },
  {
    id: 'sample-talk',
    title: 'Sample event · talk or workshop',
    kind: 'Talk',
    role: 'Your role here',
    description: 'Another placeholder collection. Add your own date, location and photos in src/content/events.ts.',
    verified: false,
    photos: [
      { src: '/events/sample-talk-1.jpg', alt: 'Sample placeholder image', caption: 'Sample photo', sample: true },
      { src: '/events/sample-talk-2.jpg', alt: 'Sample placeholder image', caption: 'Sample photo', sample: true },
    ],
  },
]
