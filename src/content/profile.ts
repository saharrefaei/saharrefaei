export const profile = {
  name: 'Sahar Refaei',
  role: 'Software Engineer',
  focus: 'Frontend & Applied AI',
  location: 'Berlin, Germany',
  timeZone: 'Europe/Berlin',
  tagline: 'Engineering thoughtful digital experiences. Exploring the future of intelligent software.',
  siteUrl: 'https://saharrefaei.uk/',
} as const

export const links = {
  github: 'https://github.com/saharrefaei',
  linkedin: 'https://www.linkedin.com/in/sahar-refaei-585830214',
  email: 'mailto:saharrefaei1999@gmail.com',
} as const

export const emailAddress = 'saharrefaei1999@gmail.com'

export const navItems = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Work' },
  { id: 'projects', label: 'Projects' },
  { id: 'interests', label: 'Focus' },
  { id: 'contact', label: 'Contact' },
] as const

export const about = {
  statement:
    'I build real-world digital products with React, React Native and TypeScript — and I am increasingly drawn to the point where software starts to think: LLM-powered applications, agents, and the architecture that makes them reliable.',
  paragraph:
    'My background is modern frontend engineering. My direction is AI engineering — integrating models into useful products instead of only experimenting with them. I am pursuing an M.Sc. in Artificial Intelligence to build that side on solid ground.',
  facts: [
    { label: 'Based in', value: 'Berlin, Germany' },
    { label: 'Experience', value: '4+ years in software' },
    { label: 'Studying', value: 'M.Sc. Artificial Intelligence' },
    { label: 'Working on', value: 'Frontend architecture & applied AI' },
  ],
} as const

export type Education = {
  degree: string
  field: string
  school: string
  period?: string
}

export const education: Education[] = [
  {
    degree: 'M.Sc.',
    field: 'Artificial Intelligence',
    school: 'BTU Cottbus–Senftenberg, Germany',
  },
  {
    degree: 'B.Sc.',
    field: 'Computer Engineering',
    school: 'University of Birjand, Iran',
    period: '2017 – 2021',
  },
]
