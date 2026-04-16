import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

const projects = [
  {
    number: '01',
    title: 'Advertiser Platform',
    subtitle: 'Full-Stack · Almedia GmbH',
    year: '2025',
    color: '#6b46c1',
    impact: ['99.8% data accuracy', '100% manual ops eliminated', 'Sub-200ms response time'],
    bullets: [
      'Developed real-time advertising dashboard for 200+ gaming advertisers with campaign management capabilities',
      'Built 15+ interactive data visualizations using TanStack Table and D3.js with responsive UI',
      'Created automated billing module with direct HubSpot CRM integration, reducing invoice processing from 3 days → 5 minutes',
      'Architected microservices for automated cost data submission to 3 Mobile Measurement Partners (AppsFlyer, Adjust, Singular)',
      'Developed 8 RESTful APIs handling 2M+ daily cost events with sub-200ms response times',
      'Implemented hourly Cloud Scheduler jobs with retry logic, error handling, and job state tracking',
      'Deployed on GCP Cloud Run with auto-scaling and CI/CD pipeline via Cloud Build',
    ],
    tech: ['React', 'FastAPI', 'BigQuery', 'GCP Cloud Run', 'MongoDB', 'HubSpot API', 'D3.js', 'TanStack Table'],
  },
  {
    number: '02',
    title: 'HubSpot ↔ BigQuery Sync',
    subtitle: 'Data Engineering · Almedia GmbH',
    year: '2025',
    color: '#0ea5e9',
    impact: ['95% manual entry eliminated', '15 hrs/week saved', '3.4K+ records synced'],
    bullets: [
      'Engineered bidirectional sync service between BigQuery data warehouse and HubSpot CRM',
      'Built batch upsert operations processing 500+ records with custom mapping for 50+ fields',
      'Created 3 custom HubSpot objects (Providers, Games, Offers) with full relationship associations',
      'Scheduled daily automated sync via Cloud Scheduler with incremental change detection',
      'Extended with 3 additional custom objects: offer_countries, offer_event_bids, offer_caps — 3.4K+ records synced',
      'Implemented async architecture with connection pooling, caching, and retry handling',
    ],
    tech: ['Python', 'BigQuery', 'Dataform', 'Cloud Scheduler', 'HubSpot API', 'asyncio', 'httpx'],
  },
  {
    number: '03',
    title: 'User Suppression Services',
    subtitle: 'Backend · Almedia GmbH',
    year: '2024',
    color: '#f59e0b',
    impact: ['1M+ device IDs/day', 'Zero wasted ad spend', '100% automated'],
    bullets: [
      'Built automated suppression list management preventing ad spend on existing/converted users',
      'Developed Cloud Run Jobs fetching 1M+ device IDs daily with batch processing (10K records per request)',
      'Implemented CLI tool with incremental sync, full upload, and resume-from-failure modes',
      'Added rate limiting and retry logic for robust API interaction under high load',
      'Deployed as serverless jobs with Cloud Scheduler for daily automated execution',
      'Achieved zero downtime with idempotent job design and state tracking',
    ],
    tech: ['Python', 'GCP Cloud Run Jobs', 'Cloud Scheduler', 'BigQuery', 'CLI', 'REST APIs'],
  },
  {
    number: '04',
    title: 'Federated Learning — ViT Early-Exit',
    subtitle: 'AI Research · BTU Cottbus',
    year: '2024',
    color: '#10b981',
    impact: ['62.5% global accuracy', '+3% mean client accuracy', 'Outperformed full-model baseline'],
    bullets: [
      'Designed client-to-early-exit FL framework where each client trains only a depth-specific ViT sub-network based on local data complexity',
      'Implemented mask-aware federated aggregation, averaging only client-updated parameters across a shared global model',
      'Developed complexity-aware routing using entropy and confidence metrics for adaptive inference depth selection',
      'Evaluated model behavior under varying system constraints and non-IID data distributions across 20+ heterogeneous clients',
      'Achieved 62.5% global accuracy — outperforming full-model baseline by ~1% and boosting mean client accuracy by 3%',
    ],
    tech: ['PyTorch', 'Vision Transformers (ViT)', 'Federated Learning', 'Python', 'NumPy', 'Matplotlib'],
  },
  {
    number: '05',
    title: 'Grid Operations Dashboard',
    subtitle: 'Full-Stack · 50Hertz Transmission',
    year: '2023',
    color: '#ec4899',
    impact: ['40% productivity boost', '35% cloud efficiency gain', '10+ animated interfaces'],
    bullets: [
      'Engineered scalable mission-critical dashboard with React, Python, and MongoDB for power grid operators',
      'Integrated robust CI/CD pipeline into Kubernetes infrastructure, increasing team productivity by 40%',
      'Crafted 5+ FastAPI and REST APIs in Python for efficient real-time client data requests',
      'Designed 10+ interactive animated interfaces using Framer Motion, MUI, CSS, and TypeScript',
      'Deployed and optimized scalable cloud solutions on AWS, improving infrastructure efficiency by 35%',
      'Refactored modular code architecture, reducing registration and onboarding time by 48%',
    ],
    tech: ['React', 'Python', 'MongoDB', 'FastAPI', 'AWS', 'Kubernetes', 'Framer Motion', 'MUI', 'TypeScript'],
  },
];

function ProjectCard({ project, index }: { project: (typeof projects)[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-4, 4]);
  const sRotateX = useSpring(rotateX, { stiffness: 260, damping: 30 });
  const sRotateY = useSpring(rotateY, { stiffness: 260, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
    if (overlayRef.current) {
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      overlayRef.current.style.background = `radial-gradient(300px circle at ${sx}px ${sy}px, ${project.color}15, transparent 70%)`;
      overlayRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    if (overlayRef.current) overlayRef.current.style.opacity = '0';
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.005 }}
      className="glass-panel"
      style={{
        rotateX: sRotateX,
        rotateY: sRotateY,
        transformPerspective: 1400,
        padding: 'clamp(1.8rem, 2.5vw, 2.8rem)',
        cursor: 'default',
        borderLeft: `3px solid ${project.color}55`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 0% 50%, ${project.color}07, transparent 55%)`,
      }} />
      <div ref={overlayRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0, transition: 'opacity 0.3s ease' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: project.color, opacity: 0.18, lineHeight: 1 }}>
                {project.number}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {project.year}
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 2.2vw, 1.9rem)', color: 'white', lineHeight: 1.1, marginBottom: '0.3rem' }}>
              {project.title}
            </h3>
            <p style={{ color: project.color, fontSize: '0.82rem', letterSpacing: '0.04em', opacity: 0.85 }}>
              {project.subtitle}
            </p>
          </div>

          {/* Impact badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
            {project.impact.map(badge => (
              <span key={badge} style={{
                background: `${project.color}12`,
                border: `1px solid ${project.color}30`,
                padding: '3px 12px', borderRadius: '20px',
                fontSize: '0.74rem', color: project.color, fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                ✓ {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: `linear-gradient(90deg, ${project.color}30, transparent)`, marginBottom: '1.4rem' }} />

        {/* Bullets */}
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {project.bullets.map((b, i) => (
            <li key={i} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
              <span style={{ color: project.color, marginTop: '5px', flexShrink: 0, fontSize: '0.6rem' }}>◆</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', lineHeight: 1.65 }}>{b}</span>
            </li>
          ))}
        </ul>

        {/* Tech tags */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {project.tech.map(t => (
            <span key={t} style={{
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '3px 12px', borderRadius: '20px',
              fontSize: '0.78rem', color: 'var(--text-secondary)',
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  return (
    <section id="projects" style={{ padding: '10vh 8vw 10vh', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              color: 'var(--accent-light)', letterSpacing: '0.3em',
              textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '1.2rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}
          >
            <span style={{ display: 'inline-block', width: '30px', height: '1px', background: 'var(--accent-light)' }} />
            Featured Work
          </motion.p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            color: 'white', lineHeight: 0.95, letterSpacing: '-0.03em',
          }}>
            Selected<br />
            <span className="accent-gradient-text">Projects</span>
          </h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {projects.map((p, i) => <ProjectCard key={p.number} project={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
