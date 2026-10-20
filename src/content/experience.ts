import type { Challenge, Impact } from './detail'

export type ExperienceDetail = {
  overview: string[]
  responsibilities: string[]
  /** Important projects and contributions. `projectId` links to that project's own detail view. */
  contributions?: { title: string; body: string; projectId?: string }[]
  challenges?: Challenge[]
  impact?: Impact
  /** Fuller tools list; falls back to `stack`. */
  tools?: string[]
}

export type Experience = {
  id: string
  company: string
  /** Short label for the big 3D title (letters, digits and basic punctuation only). */
  shortName: string
  role: string
  location: string
  /** Free-form so entries without a confirmed end date stay honest. */
  period: string
  current?: boolean
  summary: string
  stack: string[]
  detail: ExperienceDetail
}

/**
 * Public, non-confidential summaries only: no internal system names, unreleased
 * work or company metrics. Newest first.
 */
export const experience: Experience[] = [
  {
    id: 'taxfix',
    company: 'Taxfix',
    shortName: 'TAXFIX',
    role: 'Software Engineer',
    location: 'Berlin, Germany',
    period: 'Jun 2026 – Present',
    current: true,
    summary:
      'Building product features for a consumer tax app with React, React Native and TypeScript — shipping experiment-driven changes with feature flags, A/B testing and analytics. I also build with AI agents and work with Python and BigQuery.',
    stack: ['React', 'React Native', 'TypeScript', 'AI agents', 'Python', 'BigQuery'],
    detail: {
      overview: [
        'I build product features for a consumer tax app, working in React and React Native with TypeScript.',
        'Changes ship the experiment-driven way: with feature flags, A/B testing and analytics.',
      ],
      responsibilities: [
        'Build and ship product features in React, React Native and TypeScript.',
        'Roll changes out with feature flags and measure them with A/B testing and analytics.',
        'Build with AI agents.',
        'Work with Python and BigQuery where product questions need data.',
      ],
    },
  },
  {
    id: 'almedia',
    company: 'Almedia',
    shortName: 'ALMEDIA',
    role: 'Software & Data Engineer',
    location: 'Berlin, Germany',
    period: 'Jun 2025 – 2026',
    summary:
      'Full-stack and data engineering across React frontends, Python services and BigQuery pipelines — internal billing, reporting and CRM tooling.',
    stack: ['React', 'Python', 'FastAPI', 'BigQuery'],
    detail: {
      overview: [
        'Full-stack and data engineering: React frontends, Python services and BigQuery pipelines behind internal billing, reporting and CRM tooling.',
        'The work sat between product and data: dashboards and APIs on one side, scheduled pipelines and CRM integrations on the other.',
      ],
      responsibilities: [
        'Design and build FastAPI services and React interfaces for billing and reporting.',
        'Model and maintain BigQuery data (Dataform) that the services and reports depend on.',
        'Integrate the data warehouse with the CRM and with external partner APIs.',
        'Keep scheduled pipelines reliable: retries, bounded concurrency and job-state tracking.',
        'Deploy on GCP (Cloud Run, Cloud Scheduler) with CI/CD on Cloud Build.',
      ],
      contributions: [
        {
          title: 'Advertiser Platform',
          body: 'A dashboard and billing platform for advertisers, with automated CRM-connected invoicing and cost-data services.',
          projectId: 'advertiser-platform',
        },
        {
          title: 'HubSpot ↔ BigQuery Sync',
          body: 'A bidirectional sync service that keeps warehouse data and CRM objects aligned.',
          projectId: 'hubspot-bigquery-sync',
        },
        {
          title: 'User Suppression Services',
          body: 'Automated suppression-list jobs so ad spend is not wasted on users who already converted.',
          projectId: 'user-suppression',
        },
        {
          title: 'Billing entities, end to end',
          body: 'Backend, frontend, CRM sync, tax-ID lifecycle, notifications and the billing UI.',
        },
        {
          title: 'Provider-facing cost API',
          body: 'A multi-dimensional reporting API for external providers, with hashed API-key authentication, rate limiting and BigQuery/Dataform models underneath.',
        },
      ],
      challenges: [
        {
          challenge: 'Slow billing endpoints.',
          solution: 'Reworked request handling with async HTTP calls, connection pooling and caching.',
        },
        {
          challenge: 'Reliability of the cost-data pipeline to a measurement partner.',
          solution: 'Stabilised it with bounded concurrency, retry logic, polling and explicit job states (pending, failed, applied).',
        },
        {
          challenge: 'Re-processing historical cost data.',
          solution:
            'Built a reusable backfill CLI that detects the affected apps, validates the capability and sends batched, rate-limited requests.',
        },
      ],
      impact: {
        notes: [
          'Billing, CRM sync and partner cost reporting moved from manual steps to scheduled jobs with tracked state.',
          'Shipped further product work along the way: game budgets, feature-flag improvements, centralised Slack notifications and security hardening.',
        ],
      },
      tools: [
        'React',
        'Python',
        'FastAPI',
        'BigQuery',
        'Dataform',
        'GCP Cloud Run',
        'Cloud Scheduler',
        'Cloud Build',
        'MongoDB',
        'HubSpot API',
        'httpx',
        'asyncio',
      ],
    },
  },
  {
    id: '50hertz',
    company: '50Hertz Transmission',
    shortName: '50HERTZ',
    role: 'Software Developer',
    location: 'Berlin, Germany',
    period: 'Mar 2023 – Jun 2025',
    summary:
      'Operator dashboards in React, TypeScript and Python, with APIs on FastAPI, MongoDB storage, CI/CD on Kubernetes and AWS deployments.',
    stack: ['React', 'TypeScript', 'FastAPI', 'Kubernetes', 'AWS'],
    detail: {
      overview: [
        'Software development for a transmission system operator: mission-critical dashboards for the people who run the power grid.',
        'I worked across the stack, from animated React interfaces to the Python APIs behind them and the Kubernetes and AWS infrastructure they run on.',
      ],
      responsibilities: [
        'Build operator-facing interfaces in React and TypeScript with MUI and Framer Motion.',
        'Design FastAPI and REST APIs that serve real-time data to those interfaces.',
        'Store application data in MongoDB.',
        'Integrate CI/CD into the team’s Kubernetes setup and deploy to AWS.',
        'Refactor toward a modular code architecture.',
      ],
      contributions: [
        {
          title: 'Grid Operations Dashboard',
          body: 'A scalable dashboard for grid operators, from the interface to the APIs and deployment.',
          projectId: 'grid-operations-dashboard',
        },
      ],
      challenges: [
        {
          challenge: 'Serving real-time data to the dashboard.',
          solution: 'FastAPI and REST endpoints built for real-time client requests, paired with interactive, animated React interfaces.',
        },
        {
          challenge: 'Releasing to Kubernetes and AWS.',
          solution: 'A CI/CD pipeline integrated into Kubernetes, and cloud deployments tuned on AWS.',
        },
        {
          challenge: 'Registration and onboarding time.',
          solution: 'Refactored the code into a modular architecture, which cut registration and onboarding time.',
        },
      ],
      impact: {
        notes: [
          'A CI/CD pipeline that raised the team’s productivity.',
          'More efficient cloud infrastructure on AWS.',
        ],
      },
      tools: ['React', 'TypeScript', 'MUI', 'Framer Motion', 'Python', 'FastAPI', 'MongoDB', 'Kubernetes', 'AWS', 'CI/CD'],
    },
  },
  {
    id: 'btu',
    company: 'BTU Cottbus–Senftenberg',
    shortName: 'BTU COTTBUS',
    role: 'AI Engineer (Research)',
    location: 'Cottbus, Germany',
    period: 'Mar 2023 – Jun 2025',
    summary:
      'Federated-learning research with Vision Transformers and early-exit architectures: mask-aware aggregation and complexity-aware routing across heterogeneous clients.',
    stack: ['PyTorch', 'Vision Transformers', 'Federated Learning'],
    detail: {
      overview: [
        'Research on federated learning with Vision Transformers, as part of my M.Sc. in Artificial Intelligence.',
        'The question: how can clients with different data and different compute all train one shared model, without every client having to train all of it?',
      ],
      responsibilities: [
        'Design a federated-learning framework in which each client trains only the ViT depth that suits its data.',
        'Implement the training, aggregation and evaluation in PyTorch.',
        'Evaluate behaviour under system constraints and non-IID data across many heterogeneous clients.',
      ],
      contributions: [
        {
          title: 'Federated Learning with Early-Exit ViTs',
          body: 'The framework, aggregation and routing developed for this research.',
          projectId: 'federated-vit',
        },
      ],
      challenges: [
        {
          challenge: 'Clients differ in how complex their data is and how much they can compute.',
          solution: 'A client-to-early-exit design: each client trains a depth-specific sub-network of a shared ViT.',
        },
        {
          challenge: 'Sub-networks of different depths cannot simply be averaged.',
          solution: 'Mask-aware aggregation that averages only the parameters each client actually updated.',
        },
        {
          challenge: 'Choosing how deep to run a model at inference time.',
          solution: 'Complexity-aware routing based on entropy and confidence.',
        },
      ],
      impact: {
        metrics: [
          { value: '62.5%', label: 'Global accuracy', note: 'about 1% above the full-model baseline' },
          { value: '+3%', label: 'Mean client accuracy' },
        ],
      },
      tools: ['PyTorch', 'Vision Transformers', 'Federated Learning', 'Python', 'NumPy', 'Matplotlib'],
    },
  },
  {
    id: 'part-software',
    company: 'Part Software Group',
    shortName: 'PART SOFTWARE',
    role: 'Data Engineer',
    location: 'Mashhad, Iran',
    period: 'Jan 2019 – Dec 2021',
    summary:
      'Product interfaces with Vue.js and Node.js on PostgreSQL, plus database tuning, automated backup and recovery, and internal process documentation.',
    stack: ['Vue.js', 'Node.js', 'PostgreSQL'],
    detail: {
      overview: [
        'Data engineering with a hands-on product side: building interfaces on top of the databases I looked after.',
      ],
      responsibilities: [
        'Build product interfaces with Vue.js and Node.js on PostgreSQL.',
        'Tune database performance, including scripted testing and query optimisation.',
        'Manage and optimise product databases, including automated backup and recovery.',
        'Document workflows and internal processes for the team.',
      ],
      impact: {
        notes: ['Automated backup and recovery for product databases.', 'Documentation that made onboarding new teammates easier.'],
      },
      tools: ['Vue.js', 'Node.js', 'PostgreSQL', 'Bash'],
    },
  },
]
