export type InterestGroup = 'Craft' | 'Intelligence' | 'Tooling'

export type Interest = {
  id: string
  title: string
  /** Short code rendered on the dot-matrix readout. */
  code: string
  group: InterestGroup
  note: string
}

/** Wording stays close to the profile README. */
export const interests: Interest[] = [
  {
    id: 'react',
    title: 'React & React Native',
    code: 'REACT',
    group: 'Craft',
    note: 'My home turf: modern frontend engineering across web and mobile.',
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    code: 'TS',
    group: 'Craft',
    note: 'Code that stays understandable for engineers and safe to change.',
  },
  {
    id: 'architecture',
    title: 'Frontend architecture',
    code: 'ARCH',
    group: 'Craft',
    note: 'Turning complex product problems into simple, scalable, maintainable systems.',
  },
  {
    id: 'llm',
    title: 'Large Language Models',
    code: 'LLM',
    group: 'Intelligence',
    note: 'LLM-powered applications — and how to evaluate and test them properly.',
  },
  {
    id: 'agents',
    title: 'AI agents',
    code: 'AGENTS',
    group: 'Intelligence',
    note: 'Agentic workflows and automation: software that acts, not only answers.',
  },
  {
    id: 'rag',
    title: 'Retrieval-Augmented Generation',
    code: 'RAG',
    group: 'Intelligence',
    note: 'Embeddings, vector search and retrieval — grounding models in real data. Currently deepening this.',
  },
  {
    id: 'applied-ai',
    title: 'Applied AI',
    code: 'AI',
    group: 'Intelligence',
    note: 'Making AI a native part of software architecture rather than an add-on feature.',
  },
  {
    id: 'devtools',
    title: 'Developer tooling',
    code: 'DEVTOOLS',
    group: 'Tooling',
    note: 'AI-assisted software development and tools that make engineers faster.',
  },
]
