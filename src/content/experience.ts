export type Experience = {
  id: string
  company: string
  role: string
  location: string
  /** Free-form so entries without a confirmed end date stay honest. */
  period: string
  current?: boolean
  summary: string
  stack: string[]
}

/**
 * Public, non-confidential summaries only: no internal systems, unreleased
 * work or company metrics. Newest first.
 */
export const experience: Experience[] = [
  {
    id: 'taxfix',
    company: 'Taxfix',
    role: 'Software Engineer',
    location: 'Berlin, Germany',
    period: 'Present',
    current: true,
    summary:
      'Building product features for a consumer tax app with React, React Native and TypeScript — shipping experiment-driven changes with feature flags, A/B testing and analytics.',
    stack: ['React', 'React Native', 'TypeScript'],
  },
  {
    id: 'almedia',
    company: 'Almedia',
    role: 'Software & Data Engineer',
    location: 'Berlin, Germany',
    period: '2025',
    summary:
      'Full-stack and data engineering across React frontends, Python services and BigQuery pipelines — internal billing, reporting and CRM tooling.',
    stack: ['React', 'Python', 'FastAPI', 'BigQuery'],
  },
  {
    id: '50hertz',
    company: '50Hertz Transmission',
    role: 'Software Developer',
    location: 'Berlin, Germany',
    period: 'Mar 2023 – Jun 2025',
    summary:
      'Operator dashboards in React, TypeScript and Python, with APIs on FastAPI, MongoDB storage, CI/CD on Kubernetes and AWS deployments.',
    stack: ['React', 'TypeScript', 'FastAPI', 'Kubernetes', 'AWS'],
  },
  {
    id: 'btu',
    company: 'BTU Cottbus–Senftenberg',
    role: 'AI Engineer (Research)',
    location: 'Cottbus, Germany',
    period: 'Mar 2023 – Jun 2025',
    summary:
      'Federated-learning research with Vision Transformers and early-exit architectures: mask-aware aggregation and complexity-aware routing across heterogeneous clients.',
    stack: ['PyTorch', 'Vision Transformers', 'Federated Learning'],
  },
  {
    id: 'part-software',
    company: 'Part Software Group',
    role: 'Data Engineer',
    location: 'Mashhad, Iran',
    period: 'Jan 2019 – Dec 2021',
    summary:
      'Product interfaces with Vue.js and Node.js on PostgreSQL, plus database tuning, automated backup and recovery, and internal process documentation.',
    stack: ['Vue.js', 'Node.js', 'PostgreSQL'],
  },
]
