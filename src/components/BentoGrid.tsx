import { motion } from 'framer-motion';
import { Database, Code2, Server, GitBranch, Cloud, Cpu, BrainCircuit, Globe } from 'lucide-react';
import { useRef, type ReactNode } from 'react';

function SpotlightCard({
  children,
  style,
  color = 'rgba(107, 70, 193, 0.18)',
  ...props
}: {
  children: ReactNode;
  style?: React.CSSProperties;
  color?: string;
  [key: string]: unknown;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !overlayRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    overlayRef.current.style.background = `radial-gradient(280px circle at ${x}px ${y}px, ${color}, transparent 70%)`;
    overlayRef.current.style.opacity = '1';
  };

  const handleMouseLeave = () => {
    if (overlayRef.current) overlayRef.current.style.opacity = '0';
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass-panel"
      style={{ position: 'relative', overflow: 'hidden', cursor: 'none', ...style }}
      {...props}
    >
      <div
        ref={overlayRef}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          opacity: 0, transition: 'opacity 0.35s ease',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
        {children}
      </div>
    </motion.div>
  );
}

const skillVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

function TagList({ tags, color = '#cbd5e1', borderColor = 'rgba(255,255,255,0.1)' }: { tags: string[]; color?: string; borderColor?: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {tags.map((tag, i) => (
        <motion.span
          key={tag}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06 * i, duration: 0.35 }}
          whileHover={{ scale: 1.08, borderColor: 'var(--accent-light)', color: 'var(--accent-light)' }}
          style={{
            border: `1px solid ${borderColor}`,
            padding: '4px 14px', borderRadius: '20px',
            fontSize: '0.85rem', color,
            cursor: 'none', transition: 'all 0.2s',
          }}
        >
          {tag}
        </motion.span>
      ))}
    </div>
  );
}

export default function BentoGrid() {
  return (
    <section id="expertise" style={{ padding: '15vh 10vw', maxWidth: '1400px', margin: '0 auto' }}>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        style={{ marginBottom: '4rem' }}
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
          Skills & Expertise
        </motion.p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 0.95, letterSpacing: '-0.03em', color: 'white' }}>
          The Toolkit
        </h2>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', gridAutoRows: 'minmax(220px, auto)' }}
        className="bento-outer-grid">

        {/* Bio – full width */}
        <SpotlightCard
          variants={skillVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          whileHover={{ boxShadow: '0 0 40px rgba(107, 70, 193, 0.15)' }}
          style={{ gridColumn: '1 / -1', padding: 'clamp(2rem, 3vw, 3.5rem)' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: '1rem', color: 'white' }}>
                Who I Am
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.8, maxWidth: '720px' }}>
                MSc in <strong style={{ color: 'var(--accent-light)' }}>Artificial Intelligence</strong> · 5+ years across Berlin and beyond.
                I build full-stack platforms, design data pipelines, and deploy AI systems at scale — from 2M+ daily cost events on GCP to federated learning research on Vision Transformers.
                I own problems end-to-end: backend, frontend, infra, and data.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', opacity: 0.35 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>
                <Globe size={64} color="var(--accent-light)" />
              </motion.div>
            </div>
          </div>
        </SpotlightCard>

        {/* Languages */}
        <SpotlightCard
          variants={skillVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          whileHover={{ boxShadow: '0 0 40px rgba(107, 70, 193, 0.12)' }}
          style={{ gridColumn: 'span 4', padding: '2.5rem' }}
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <Code2 color="var(--accent)" size={40} style={{ marginBottom: '1.5rem' }} />
          </motion.div>
          <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', marginBottom: '1rem', color: 'white' }}>Languages</h3>
          <TagList tags={['Python', 'TypeScript', 'JavaScript', 'SQL', 'Java']} />
        </SpotlightCard>

        {/* Frontend */}
        <SpotlightCard
          variants={skillVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          whileHover={{ boxShadow: '0 0 40px rgba(107, 70, 193, 0.12)' }}
          style={{ gridColumn: 'span 4', padding: '2.5rem' }}
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
            <Globe color="var(--accent)" size={40} style={{ marginBottom: '1.5rem' }} />
          </motion.div>
          <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', marginBottom: '1rem', color: 'white' }}>Frontend</h3>
          <TagList tags={['React', 'TypeScript', 'D3.js', 'Framer Motion', 'TanStack Table', 'MUI', 'Vue.js']} />
        </SpotlightCard>

        {/* Backend */}
        <SpotlightCard
          variants={skillVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          whileHover={{ boxShadow: '0 0 40px rgba(107, 70, 193, 0.12)' }}
          style={{ gridColumn: 'span 4', padding: '2.5rem' }}
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
            <Server color="var(--accent)" size={40} style={{ marginBottom: '1.5rem' }} />
          </motion.div>
          <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', marginBottom: '1rem', color: 'white' }}>Backend</h3>
          <TagList tags={['FastAPI', 'Node.js', 'REST APIs', 'Microservices', 'LLM APIs', 'Prompt Engineering']} />
        </SpotlightCard>

        {/* Data & AI – wide */}
        <SpotlightCard
          color="rgba(14, 165, 233, 0.14)"
          variants={skillVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          whileHover={{ boxShadow: '0 0 40px rgba(14, 165, 233, 0.12)' }}
          style={{ gridColumn: 'span 8', padding: '2.5rem' }}
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}>
            <BrainCircuit color="#0ea5e9" size={40} style={{ marginBottom: '1.5rem' }} />
          </motion.div>
          <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', marginBottom: '1rem', color: 'white' }}>AI / ML & Data</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.2rem', maxWidth: '480px' }}>
            From Vision Transformers in federated learning research to LLM-powered production APIs — and BigQuery data models serving live business intelligence.
          </p>
          <TagList
            tags={['PyTorch', 'Vision Transformers', 'Federated Learning', 'BigQuery', 'Dataform', 'MongoDB', 'PostgreSQL', 'Redis', 'Model Evaluation']}
            color="#7dd3fc"
            borderColor="rgba(14,165,233,0.25)"
          />
        </SpotlightCard>

        {/* Cloud & DevOps */}
        <SpotlightCard
          color="rgba(16, 185, 129, 0.12)"
          variants={skillVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          whileHover={{ boxShadow: '0 0 40px rgba(16, 185, 129, 0.12)' }}
          style={{ gridColumn: 'span 4', padding: '2.5rem' }}
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}>
            <Cloud color="#10b981" size={40} style={{ marginBottom: '1.5rem' }} />
          </motion.div>
          <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', marginBottom: '1rem', color: 'white' }}>Cloud & DevOps</h3>
          <TagList
            tags={['GCP', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Cloud Run', 'Cloud Scheduler']}
            color="#6ee7b7"
            borderColor="rgba(16,185,129,0.25)"
          />
        </SpotlightCard>

        {/* Tooling */}
        <SpotlightCard
          color="rgba(245, 158, 11, 0.1)"
          variants={skillVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          whileHover={{ boxShadow: '0 0 40px rgba(245, 158, 11, 0.1)' }}
          style={{ gridColumn: 'span 4', padding: '2.5rem' }}
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}>
            <Database color="#f59e0b" size={40} style={{ marginBottom: '1.5rem' }} />
          </motion.div>
          <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', marginBottom: '1rem', color: 'white' }}>Tooling</h3>
          <TagList
            tags={['Git', 'GitHub', 'Swagger', 'Jest', 'Copilot', 'HubSpot API']}
            color="#fcd34d"
            borderColor="rgba(245,158,11,0.25)"
          />
        </SpotlightCard>

        {/* Languages spoken */}
        <SpotlightCard
          color="rgba(107, 70, 193, 0.14)"
          variants={skillVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          whileHover={{ boxShadow: '0 0 40px rgba(107, 70, 193, 0.12)' }}
          style={{ gridColumn: 'span 4', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 3 }}>
              <Cpu color="var(--accent)" size={40} style={{ marginBottom: '1.5rem' }} />
            </motion.div>
            <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', marginBottom: '1.5rem', color: 'white' }}>Languages Spoken</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {[
                { lang: 'English', level: 'Fluent', pct: 97 },
                { lang: 'German', level: 'B1', pct: 45 },
                { lang: 'Persian', level: 'Fluent', pct: 100 },
              ].map(({ lang, level, pct }) => (
                <div key={lang}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'white', fontSize: '0.9rem' }}>{lang}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{level}</span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-light))', borderRadius: '2px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>

        {/* Core strengths */}
        <SpotlightCard
          variants={skillVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          whileHover={{ boxShadow: '0 0 40px rgba(107, 70, 193, 0.15)' }}
          style={{ gridColumn: 'span 8', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
            <GitBranch color="var(--accent)" size={40} />
            <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', color: 'white', paddingTop: '4px' }}>
              Core Strengths
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {[
              { label: 'End-to-end ownership', desc: 'From DB schema to deployed UI' },
              { label: 'Performance engineering', desc: '540× billing speedup, 60% query cost cut' },
              { label: 'Data pipeline design', desc: 'BigQuery, Dataform, HubSpot sync' },
              { label: 'AI/ML deployment', desc: 'Research to production-grade systems' },
            ].map(item => (
              <div key={item.label} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>{item.label}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </SpotlightCard>

      </div>
    </section>
  );
}
