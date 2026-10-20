export type EventPhoto = {
  /** Path under /public (e.g. "/events/my-photo.jpg") or a full URL. */
  src: string
  alt: string
  caption?: string
  /** `true` while this is a placeholder. Shows a "Sample photo" badge. Leave it out for real photos. */
  sample?: boolean
}

export type CommunityEvent = {
  id: string
  title: string
  /** Short label, also drawn as the big 3D title: "Hackathon", "Community", "Talk"... */
  kind: string
  /** Your role. Keep it factual. Leave it out if you would rather not state one. */
  role?: string
  date?: string
  location?: string
  description: string
  /** `true` only for events that really happened. `false` shows a "Sample event" badge and a "SAMPLE" 3D title. */
  verified: boolean
  photos: EventPhoto[]
}

/**
 * HOW TO EDIT
 * - Photos live in `public/events/` (JPG/WebP, ~1600 px on the long side keeps the 3D scene light).
 *   Add a file there, then add `{ src: '/events/<file>', alt: '...' }` to an event below.
 * - Each event becomes one stop on the 3D journey; its photos float along the way. The fullscreen
 *   viewer, the 3D gallery and the flat fallback all read this one list.
 * - `alt` should describe what is visible (it is read aloud by screen readers).
 * - Need a placeholder? Set `sample: true` on the photo and `verified: false` on the event; the
 *   site labels it clearly as a sample everywhere.
 * - Optional: add `date: 'October 2025'` to show a date.
 */
export const events: CommunityEvent[] = [
  {
    id: 'claude-taxfix-hackathon',
    title: 'Claude × Taxfix Hackathon',
    kind: 'Hackathon',
    role: 'Helped organize',
    location: 'Berlin, Germany',
    description: 'A hackathon in Berlin, the Claude × Taxfix Hackathon. I helped organize it.',
    verified: true,
    photos: [
      { src: '/events/hackathon-01.jpg', alt: 'Attendees mingling in a large brick-and-steel hall while an icebreaker is shown on the screens' },
      { src: '/events/hackathon-02.jpg', alt: 'Attendees laughing over a long table of name cards during an icebreaker game' },
      { src: '/events/hackathon-03.jpg', alt: 'A speaker with a microphone addressing the crowd in the hall, in black and white' },
      { src: '/events/hackathon-04.jpg', alt: 'Participants discussing at a table with laptops and a monitor' },
      { src: '/events/hackathon-05.jpg', alt: 'Wide-angle view of teams working together at long wooden tables' },
      { src: '/events/hackathon-06.jpg', alt: 'A buffet with salads and a hot dish being served' },
      { src: '/events/hackathon-07.jpg', alt: 'Participants seated around tables in the hall with the Claude Community slide on the screens' },
      { src: '/events/hackathon-08.jpg', alt: 'Group photo of participants in front of the Claude Community slide' },
    ],
  },
  {
    id: 'claude-community-berlin',
    title: 'Claude Community Berlin',
    kind: 'Community',
    location: 'Berlin, Germany',
    description: 'Photos from a Claude Community Berlin event.',
    verified: true,
    photos: [
      { src: '/events/community-01.jpg', alt: 'Two volunteers at the welcome desk next to the Claude Community Berlin welcome banner' },
      { src: '/events/community-02.jpg', alt: 'An audience seated and standing in a blue-lit hall, watching a presentation' },
    ],
  },
]
