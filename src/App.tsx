import { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import CustomCursor from './components/CustomCursor';
import Background3D from './components/Background3D';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BentoGrid from './components/BentoGrid';
import ExperienceScroll from './components/ExperienceScroll';
import Marquee from './components/Marquee';
import MagneticButton from './components/MagneticButton';
import ProjectsSection from './components/ProjectsSection';
import Lenis from 'lenis';
import './index.css';

function SectionDivider() {
  return (
    <div style={{ padding: '0 8vw' }}>
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(107,70,193,0.25), rgba(255,255,255,0.06), transparent)',
          transformOrigin: 'left',
        }}
      />
    </div>
  );
}

const educationData = [
  {
    degree: 'MSc',
    years: '2022 – 2025',
    title: 'Artificial Intelligence',
    university: 'Brandenburg Technical University · Cottbus, Germany',
    description: 'Specialized in federated learning, computer vision (Vision Transformers), model evaluation, and AI systems design. Thesis focused on distributed ML with early-exit architectures across heterogeneous clients.',
    tags: ['Federated Learning', 'Vision Transformers', 'Computer Vision', 'PyTorch', 'Model Evaluation'],
    color: 'rgba(107,70,193,',
    accentColor: 'var(--accent-light)',
    borderColor: 'rgba(107,70,193,0.55)',
    delay: 0.15,
  },
  {
    degree: 'BSc',
    years: '2017 – 2021',
    title: 'Computer Engineering',
    university: 'University of Birjand · Birjand, Iran',
    description: 'Studied core computer engineering fundamentals including algorithms, data structures, software engineering, and computer networks.',
    tags: ['Algorithms', 'Data Structures', 'Software Engineering', 'Computer Networks', 'Operating Systems'],
    color: 'rgba(14,165,233,',
    accentColor: '#7dd3fc',
    borderColor: 'rgba(14,165,233,0.55)',
    delay: 0.3,
  },
];

function EducationCard({ edu }: { edu: typeof educationData[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: edu.delay }}
      className="glass-panel education-card"
      style={{
        padding: 'clamp(1.5rem, 3vw, 3.5rem)',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 'clamp(1.2rem, 3vw, 2.5rem)',
        alignItems: 'center',
        borderLeft: `3px solid ${edu.borderColor}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 0% 50%, ${edu.color}0.08), transparent 60%)`,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center',
        padding: '1.5rem 2rem',
        background: `${edu.color}0.08)`,
        border: `1px solid ${edu.color}0.2)`,
        borderRadius: '16px',
        flexShrink: 0,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: edu.accentColor, lineHeight: 1 }}>
          {edu.degree}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.4rem', letterSpacing: '0.08em' }}>
          {edu.years}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, minWidth: 0 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 2.5vw, 2.2rem)', color: 'white', marginBottom: '0.4rem' }}>
          {edu.title}
        </h3>
        <p style={{ color: edu.accentColor, fontSize: '1rem', marginBottom: '1rem' }}>
          {edu.university}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '600px' }}>
          {edu.description}
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.2rem' }}>
          {edu.tags.map(tag => (
            <span key={tag} style={{
              border: `1px solid ${edu.color}0.3)`,
              padding: '4px 14px', borderRadius: '20px',
              fontSize: '0.82rem', color: edu.accentColor,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function EducationSection() {
  return (
    <section style={{ padding: '8vh 8vw 8vh', position: 'relative' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        style={{ marginBottom: '3rem' }}
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
          Education
        </motion.p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: 0.95, letterSpacing: '-0.03em', color: 'white' }}>
          Academic Background
        </h2>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {educationData.map(edu => <EducationCard key={edu.degree} edu={edu} />)}
      </div>
    </div>
    </section>
  );
}

function ContactFooter() {
  const { scrollYProgress } = useScroll();
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const y = useTransform(scrollYProgress, [0.85, 1], isMobile ? ['0px', '0px'] : ['20px', '0px']);
  const opacity = useTransform(scrollYProgress, [0.85, 1], isMobile ? [1, 1] : [0, 1]);

  return (
    <motion.footer
      id="contact"
      style={{ y, opacity, padding: '10vh 8vw 6vh', textAlign: 'center', position: 'relative', zIndex: 10 }}
    >
      {/* Large ambient glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(107,70,193,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Section label */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          color: 'var(--accent-light)', letterSpacing: '0.3em',
          textTransform: 'uppercase', fontSize: '0.85rem',
          marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
        }}
      >
        <span style={{ display: 'inline-block', width: '30px', height: '1px', background: 'var(--accent-light)' }} />
        Get in Touch
        <span style={{ display: 'inline-block', width: '30px', height: '1px', background: 'var(--accent-light)' }} />
      </motion.p>

      {/* Big "LET'S TALK" */}
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(4rem, 14vw, 14rem)',
          lineHeight: 0.85,
          letterSpacing: '-0.04em',
          color: 'transparent',
          WebkitTextStroke: '1.5px rgba(255,255,255,0.08)',
          marginBottom: '5rem',
          userSelect: 'none',
        }}
      >
        LET'S TALK
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <MagneticButton href="mailto:saharrefaei1999@gmail.com">
          Email Me Directly
        </MagneticButton>
      </motion.div>

      {/* Social links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center', gap: '3rem' }}
      >
        {[
          { label: 'LinkedIn', href: 'https://linkedin.com/in/sahar-refaei-585830214' },
          { label: 'GitHub', href: 'https://github.com/saharrefaei' },
        ].map(link => (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ color: 'white', y: -3 }}
            style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '1rem', cursor: 'none', letterSpacing: '0.05em', transition: 'color 0.2s' }}
          >
            {link.label}
          </motion.a>
        ))}
      </motion.div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        style={{
          marginTop: '8vh',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <span>© 2026 Sahar Refaei. All rights reserved.</span>
        <span style={{ opacity: 0.4, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          Built with React · Three.js · Framer Motion
        </span>
      </motion.div>
    </motion.footer>
  );
}

function App() {
  useEffect(() => {
    // Only enable smooth scroll on desktop — native scroll is better on mobile
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <>
      <CustomCursor />
      <Background3D />
      <Navbar />

      <main style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <Hero />
        <Marquee />
        <BentoGrid />
        <SectionDivider />
        <ExperienceScroll />
        <SectionDivider />
        <ProjectsSection />
        <SectionDivider />
        <EducationSection />
        <ContactFooter />
      </main>
    </>
  );
}

export default App;
