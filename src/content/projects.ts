import type { Challenge, GalleryImage, Impact } from './detail'

/** Which generated visual (see ProjectVisual) represents the project. */
export type ProjectVisualKind = 'network' | 'orb' | 'pipeline' | 'bars' | 'layers'

export type ProjectDetail = {
  overview: string[]
  /** The problem or challenge the project answers. */
  problem?: string[]
  /** One line on my role, then the specifics. */
  role?: string
  responsibilities?: string[]
  /** Technical architecture and implementation, one titled block per concern. */
  architecture?: { title: string; body: string }[]
  /** Key contributions. */
  contributions?: string[]
  challenges?: Challenge[]
  impact?: Impact
  /** Real screenshots only. The generated artwork is an illustration and is never listed here. */
  gallery?: GalleryImage[]
  /** Experience entry this project belongs to (adds a link in the detail view). */
  experienceId?: string
}

export type Project = {
  id: string
  title: string
  kind: string
  year?: string
  description: string
  tech: string[]
  visual: ProjectVisualKind
  /** Captions for the three stages of the `pipeline` artwork (defaults to train / tune / serve). */
  visualLabels?: [string, string, string]
  github?: string
  live?: string
  detail: ProjectDetail
}

/**
 * Public repositories on github.com/saharrefaei, the M.Sc. research, and sanitised case studies of
 * work done for employers. The case studies deliberately leave out internal names, volumes and
 * company metrics. Add `live` when a verified demo URL exists; add `gallery` when real screenshots
 * exist. The layout renders both automatically.
 */
export const projects: Project[] = [
  {
    id: 'advertiser-platform',
    title: 'Advertiser Platform',
    kind: 'Full-stack · Almedia',
    year: '2025',
    description:
      'A web platform where advertisers manage campaigns and follow performance, with automated billing connected to the CRM and services that submit cost data to measurement partners.',
    tech: ['React', 'FastAPI', 'BigQuery', 'GCP Cloud Run', 'MongoDB', 'HubSpot API', 'D3.js', 'TanStack Table'],
    visual: 'bars',
    detail: {
      experienceId: 'almedia',
      overview: [
        'The Advertiser Platform is the place where advertisers run their campaigns and see how they perform, in real time.',
        'Around the dashboard sit the parts that keep the business running without hand-holding: billing that talks directly to the CRM, and services that report cost data to mobile measurement partners on a schedule.',
      ],
      problem: [
        'Campaign management, billing and cost reporting to measurement partners needed to be automated rather than handled by hand.',
      ],
      role: 'Full-stack engineer: interface, APIs, integrations and deployment.',
      responsibilities: [
        'Build the advertiser-facing dashboard and its data visualisations.',
        'Design and implement the REST APIs behind it.',
        'Integrate billing with the CRM.',
        'Build and operate the services that submit cost data to measurement partners.',
        'Deploy and run it all on GCP.',
      ],
      architecture: [
        {
          title: 'Dashboard',
          body: 'A React interface with interactive data visualisations built with TanStack Table and D3.js.',
        },
        {
          title: 'API layer',
          body: 'RESTful APIs on FastAPI that serve the dashboard and the billing module.',
        },
        {
          title: 'Data',
          body: 'BigQuery and MongoDB as the data stores behind the platform.',
        },
        {
          title: 'Billing',
          body: 'An automated billing module with a direct integration to the HubSpot CRM.',
        },
        {
          title: 'Cost submission',
          body: 'Microservices that send cost data to several mobile measurement partners, driven by Cloud Scheduler jobs with retry logic, error handling and job-state tracking.',
        },
        {
          title: 'Delivery',
          body: 'Deployed on GCP Cloud Run with auto-scaling, and shipped through a CI/CD pipeline on Cloud Build.',
        },
      ],
      contributions: [
        'Developed the real-time advertising dashboard with campaign management.',
        'Built interactive data visualisations with TanStack Table and D3.js on a responsive UI.',
        'Created the automated billing module with direct HubSpot CRM integration.',
        'Architected the microservices for automated cost-data submission to measurement partners.',
        'Developed the REST APIs that handle high-volume cost events with low latency.',
        'Implemented scheduled jobs with retry logic, error handling and job-state tracking.',
        'Deployed on Cloud Run with auto-scaling and set up CI/CD with Cloud Build.',
      ],
      impact: {
        notes: [
          'Invoicing runs through an automated, CRM-connected billing module instead of manual handling.',
          'Cost data reaches measurement partners on a schedule, with failures retried and tracked.',
        ],
      },
    },
  },
  {
    id: 'hubspot-bigquery-sync',
    title: 'HubSpot ↔ BigQuery Sync',
    kind: 'Data engineering · Almedia',
    year: '2025',
    description:
      'A bidirectional sync service that keeps the BigQuery data warehouse and the HubSpot CRM aligned, using batched upserts, custom CRM objects and incremental change detection.',
    tech: ['Python', 'BigQuery', 'Dataform', 'Cloud Scheduler', 'HubSpot API', 'asyncio', 'httpx'],
    visual: 'pipeline',
    visualLabels: ['BigQuery', 'sync', 'HubSpot'],
    detail: {
      experienceId: 'almedia',
      overview: [
        'A service that keeps the data warehouse and the CRM telling the same story, in both directions.',
        'It models core business entities as custom CRM objects with relationships between them, and syncs them on a schedule without re-sending everything every time.',
      ],
      problem: [
        'Data lived in both the warehouse and the CRM, and keeping the two aligned meant manual data entry.',
      ],
      role: 'Data engineer: designed and built the sync service end to end.',
      responsibilities: [
        'Design the sync between BigQuery and the CRM.',
        'Model the custom CRM objects and the associations between them.',
        'Make the sync efficient, incremental and reliable.',
        'Schedule and operate it.',
      ],
      architecture: [
        {
          title: 'Bidirectional sync',
          body: 'A Python service that moves data between BigQuery and the HubSpot API in both directions.',
        },
        {
          title: 'Batched upserts',
          body: 'Records are upserted in batches, with custom mapping between warehouse fields and CRM properties.',
        },
        {
          title: 'Custom CRM objects',
          body: 'Custom objects for core business entities, with full relationship associations between them. The set was later extended with further objects.',
        },
        {
          title: 'Incremental runs',
          body: 'A daily run triggered by Cloud Scheduler that detects what changed rather than syncing everything.',
        },
        {
          title: 'Async I/O',
          body: 'An asyncio and httpx architecture with connection pooling, caching and retry handling for the CRM API.',
        },
      ],
      contributions: [
        'Engineered the bidirectional sync between BigQuery and the CRM.',
        'Built batch upsert operations with custom field mapping.',
        'Created the custom CRM objects and their associations.',
        'Scheduled automated daily syncs with incremental change detection.',
        'Extended the service with additional custom objects.',
        'Implemented the async architecture with pooling, caching and retries.',
      ],
      impact: {
        notes: [
          'Manual data entry between the warehouse and the CRM was replaced by an automated, scheduled sync.',
        ],
      },
    },
  },
  {
    id: 'user-suppression',
    title: 'User Suppression Services',
    kind: 'Backend · Almedia',
    description:
      'Automated suppression-list management that stops ad spend on users who already converted, built as serverless jobs with an incremental, resumable CLI.',
    tech: ['Python', 'GCP Cloud Run Jobs', 'Cloud Scheduler', 'BigQuery', 'CLI', 'REST APIs'],
    visual: 'layers',
    detail: {
      experienceId: 'almedia',
      overview: [
        'Advertising budget should not be spent on people who are already customers. This service keeps suppression lists up to date automatically so that it is not.',
        'It runs as serverless jobs on a schedule, and ships with a command-line tool for the cases where an engineer needs to run or re-run a sync by hand.',
      ],
      problem: [
        'Suppression lists had to be kept in step with who had already converted, for a large daily volume of device identifiers.',
      ],
      role: 'Backend engineer: designed and built the jobs and the CLI.',
      responsibilities: [
        'Design the batch process that reads from BigQuery and pushes to an external API.',
        'Make it safe to retry and resume.',
        'Operate it as scheduled serverless jobs.',
      ],
      architecture: [
        {
          title: 'Serverless jobs',
          body: 'Cloud Run Jobs triggered daily by Cloud Scheduler, reading device identifiers from BigQuery in batches.',
        },
        {
          title: 'CLI',
          body: 'A command-line tool with three modes: incremental sync, full upload and resume-from-failure.',
        },
        {
          title: 'Resilient API use',
          body: 'Rate limiting and retry logic so the integration holds up under load.',
        },
        {
          title: 'Idempotency',
          body: 'Idempotent job design with state tracking, so a failed or repeated run causes no duplicate work and no downtime.',
        },
      ],
      contributions: [
        'Built automated suppression-list management to avoid spend on existing or converted users.',
        'Developed Cloud Run Jobs that process device identifiers in batches.',
        'Implemented the CLI with incremental, full and resume modes.',
        'Added rate limiting and retry logic for the external API.',
        'Deployed as serverless jobs with scheduled daily execution.',
      ],
      impact: {
        notes: [
          'Suppression updates run automatically every day, with no manual steps.',
          'Failed runs resume from where they stopped instead of starting over.',
        ],
      },
    },
  },
  {
    id: 'federated-vit',
    title: 'Federated Learning with Early-Exit ViTs',
    kind: 'M.Sc. research',
    year: '2024',
    description:
      'A federated-learning framework where each client trains only the Vision Transformer depth that fits its local data complexity — combined with mask-aware aggregation and entropy-based routing.',
    tech: ['PyTorch', 'Vision Transformers', 'Federated Learning', 'Python'],
    visual: 'network',
    // No `github`: the repository (Reliable-and-Secure-Systems/Federated-learning) is private, so a link would 404.
    // Add it back once the repository is public.
    detail: {
      experienceId: 'btu',
      overview: [
        'Federated learning trains one shared model across many clients without moving their data. In practice the clients are not alike: their data differs in how hard it is, and their hardware differs in what it can handle.',
        'This framework lets every client train only the Vision Transformer depth that fits its own data, then combines the results into a single global model.',
      ],
      problem: [
        'Standard federated learning asks every client to train the full model. That ignores how different the clients are, in the complexity of their data and in the constraints of their systems.',
      ],
      role: 'AI engineer and researcher: designed the framework, implemented it in PyTorch and ran the evaluation.',
      responsibilities: [
        'Design the client-to-early-exit training framework.',
        'Implement training, aggregation and routing.',
        'Evaluate under varying system constraints and non-IID data distributions.',
      ],
      architecture: [
        {
          title: 'Client-to-early-exit',
          body: 'Each client trains a depth-specific sub-network of a shared ViT, chosen from the complexity of its local data.',
        },
        {
          title: 'Mask-aware aggregation',
          body: 'The global model averages only the parameters that a client actually updated, so shallow and deep clients combine cleanly.',
        },
        {
          title: 'Complexity-aware routing',
          body: 'Entropy and confidence metrics decide at inference time how deep an input needs to go.',
        },
        {
          title: 'Evaluation setup',
          body: 'Experiments across many heterogeneous clients (20+) with non-IID data and varying system constraints.',
        },
      ],
      contributions: [
        'Designed the early-exit federated-learning framework.',
        'Implemented mask-aware aggregation across a shared global model.',
        'Developed complexity-aware routing using entropy and confidence.',
        'Evaluated behaviour across heterogeneous clients and data distributions.',
      ],
      impact: {
        metrics: [
          { value: '62.5%', label: 'Global accuracy', note: 'about 1% above the full-model baseline' },
          { value: '+3%', label: 'Mean client accuracy' },
        ],
      },
    },
  },
  {
    id: 'grid-operations-dashboard',
    title: 'Grid Operations Dashboard',
    kind: 'Full-stack · 50Hertz',
    year: '2023',
    description:
      'A scalable, mission-critical dashboard for power-grid operators, built with React, Python and MongoDB, with a CI/CD pipeline on Kubernetes and deployments on AWS.',
    tech: ['React', 'Python', 'MongoDB', 'FastAPI', 'AWS', 'Kubernetes', 'Framer Motion', 'MUI', 'TypeScript'],
    visual: 'network',
    detail: {
      experienceId: '50hertz',
      overview: [
        'A mission-critical dashboard for the operators who run the power grid.',
        'I worked on it across the stack: interface, APIs, storage, pipeline and cloud deployment.',
      ],
      problem: ['Grid operators need a dependable tool that serves real-time data through a clear interface.'],
      role: 'Software developer: full-stack across interface, APIs and deployment.',
      responsibilities: [
        'Build the dashboard interface in React and TypeScript.',
        'Design the Python APIs that feed it.',
        'Integrate CI/CD into the Kubernetes setup and deploy to AWS.',
        'Refactor toward a modular architecture.',
      ],
      architecture: [
        {
          title: 'Interface',
          body: 'Interactive, animated interfaces built with React, TypeScript, MUI, Framer Motion and CSS.',
        },
        {
          title: 'APIs',
          body: 'FastAPI and REST APIs in Python for efficient real-time client data requests.',
        },
        {
          title: 'Storage',
          body: 'MongoDB for application data.',
        },
        {
          title: 'Delivery',
          body: 'A CI/CD pipeline integrated into Kubernetes, with cloud solutions deployed and tuned on AWS.',
        },
        {
          title: 'Code structure',
          body: 'Refactored into a modular code architecture, which cut registration and onboarding time.',
        },
      ],
      contributions: [
        'Engineered the scalable dashboard with React, Python and MongoDB.',
        'Integrated a CI/CD pipeline into the Kubernetes infrastructure.',
        'Crafted the FastAPI and REST APIs for real-time client data requests.',
        'Designed the interactive, animated interfaces.',
        'Deployed and optimised cloud solutions on AWS.',
        'Refactored to a modular code architecture.',
      ],
      impact: {
        notes: [
          'The CI/CD pipeline raised the team’s productivity.',
          'Cloud infrastructure on AWS became more efficient.',
          'The modular refactor cut registration and onboarding time.',
        ],
      },
    },
  },
  {
    id: 'genai-images',
    title: 'Generative AI Image App',
    kind: 'Full-stack · Next.js',
    description:
      'A Next.js and TypeScript app for generating images with AI, combining Gemini and Replicate model APIs with Clerk authentication, MongoDB persistence and Cloudinary storage.',
    tech: ['Next.js', 'TypeScript', 'Gemini', 'Replicate', 'MongoDB'],
    visual: 'orb',
    github: 'https://github.com/saharrefaei/Generate-image-with-AI',
    detail: {
      overview: [
        'A full-stack Next.js app for generating images with AI.',
        'It pairs two model providers, Google’s Gemini and Replicate, with the pieces a real product needs around them: user accounts, a database and image storage.',
      ],
      role: 'Author of the repository.',
      architecture: [
        { title: 'App', body: 'Next.js 15 with React and TypeScript, styled with Tailwind CSS.' },
        { title: 'AI providers', body: 'Google’s Generative AI SDK (Gemini) and the Replicate API.' },
        { title: 'Authentication', body: 'Clerk for sign-in and user management.' },
        { title: 'Persistence', body: 'MongoDB through Mongoose.' },
        { title: 'Image storage', body: 'Cloudinary.' },
        { title: 'Deployment', body: 'A Netlify configuration is included in the repository.' },
      ],
    },
  },
  {
    id: 'sagemaker-react',
    title: 'AI App with React & AWS SageMaker',
    kind: 'ML + frontend',
    description:
      'A walkthrough of training and fine-tuning a model on AWS SageMaker, then connecting it to a React application that presents the results to users.',
    tech: ['AWS SageMaker', 'React', 'JavaScript'],
    visual: 'pipeline',
    github: 'https://github.com/saharrefaei/Ai-application-with-React---AWS-SageMaker',
    detail: {
      overview: [
        'The repository shows how to take a model trained on AWS SageMaker, fine-tune the results, and connect it to an application that presents them to users.',
      ],
      role: 'Author of the repository.',
      architecture: [
        {
          title: 'Model',
          body: 'A model trained and deployed as an AWS SageMaker endpoint.',
        },
        {
          title: 'Backend',
          body: 'A small Node.js and Express service that calls the SageMaker endpoint through the AWS SDK, accepting CSV input and returning a prediction.',
        },
        {
          title: 'Frontend',
          body: 'A React application, built with Vite, that sends data to the backend and presents the result.',
        },
      ],
    },
  },
  {
    id: 'music-visualizer',
    title: 'Generative AI Music Visualizer',
    kind: 'Creative coding · Next.js',
    description: 'An experimental Next.js app exploring generative, music-driven visuals.',
    tech: ['Next.js', 'React', 'Tailwind CSS'],
    visual: 'bars',
    github: 'https://github.com/saharrefaei/Generative-AI-Music-Visualizer-',
    detail: {
      overview: ['An early, experimental Next.js project exploring generative, music-driven visuals.'],
      role: 'Author of the repository.',
      architecture: [
        { title: 'App', body: 'Next.js 15 with React 19, styled with Tailwind CSS.' },
        { title: 'Visuals', body: 'A canvas-based component drives the visuals.' },
      ],
    },
  },
  {
    id: 'geoserver-uploader',
    title: 'GeoServer Data Uploader',
    kind: 'Automation · Python',
    description:
      'A Python tool with a desktop GUI that uploads GeoPackage and Shapefile data to a GeoServer, publishes the layers and applies styles automatically.',
    tech: ['Python', 'GeoPandas', 'Fiona', 'Tkinter'],
    visual: 'layers',
    github: 'https://github.com/saharrefaei/GeoServer',
    detail: {
      overview: [
        'A Python tool that automates getting geospatial data onto a GeoServer: it uploads GeoPackage and Shapefile data, publishes the layers and applies styles, with a desktop GUI to drive it.',
      ],
      problem: ['Publishing many geospatial layers to a GeoServer by hand means repeating the same steps for every layer.'],
      role: 'Author of the repository.',
      architecture: [
        {
          title: 'GeoServer REST API',
          body: 'Uses the GeoServer REST API (through requests) to create workspaces and data stores, upload data, publish layers and attach styles.',
        },
        {
          title: 'Geodata handling',
          body: 'GeoPandas and Fiona read layers from GeoPackage and Shapefile data, and convert Shapefiles to GeoPackage.',
        },
        {
          title: 'Desktop GUI',
          body: 'A Tkinter interface to pick files and run the upload.',
        },
      ],
    },
  },
]
