/** Which generated visual (see ProjectVisual) represents the project. */
export type ProjectVisualKind = 'network' | 'radar' | 'orb' | 'pipeline' | 'bars' | 'layers'

export type Project = {
  id: string
  title: string
  kind: string
  year?: string
  description: string
  tech: string[]
  visual: ProjectVisualKind
  github?: string
  live?: string
}

/**
 * Only real work: public repositories on github.com/saharrefaei and the
 * M.Sc. research listed on the previous portfolio. Add `live` when a
 * verified demo URL exists — the layout renders it automatically.
 */
export const projects: Project[] = [
  {
    id: 'federated-vit',
    title: 'Federated Learning with Early-Exit ViTs',
    kind: 'M.Sc. research',
    description:
      'A federated-learning framework where each client trains only the Vision Transformer depth that fits its local data complexity — combined with mask-aware aggregation and entropy-based routing.',
    tech: ['PyTorch', 'Vision Transformers', 'Federated Learning', 'Python'],
    visual: 'network',
  },
  {
    id: 'policy-radar',
    title: 'Iran Policy Radar',
    kind: 'Web app · AI-assisted outreach',
    description:
      'A dashboard for the diaspora advocacy community to browse and filter 200 decision-makers and draft outreach emails, with an optional OpenAI-powered generator that falls back to templates.',
    tech: ['JavaScript', 'Python', 'OpenAI API'],
    visual: 'radar',
    github: 'https://github.com/saharrefaei/social-media-radar-public',
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
  },
  {
    id: 'music-visualizer',
    title: 'Generative AI Music Visualizer',
    kind: 'Creative coding · Next.js',
    description: 'An experimental Next.js app exploring generative, music-driven visuals.',
    tech: ['Next.js', 'React', 'Tailwind CSS'],
    visual: 'bars',
    github: 'https://github.com/saharrefaei/Generative-AI-Music-Visualizer-',
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
  },
]
