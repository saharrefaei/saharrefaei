import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { ArrowDown } from 'lucide-react';

const ROLES = [
  'Software & Data Engineer',
  'AI / ML Engineer',
  'Full-Stack Developer',
  'Cloud & Backend Engineer',
];

function useTypewriter(words: string[], speed = 90, deleteSpeed = 45, pauseTime = 2200) {
  const [display, setDisplay] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      const t = setTimeout(() => { setIsPaused(false); setIsDeleting(true); }, pauseTime);
      return () => clearTimeout(t);
    }
    const current = words[wordIndex];
    const t = setTimeout(() => {
      if (!isDeleting) {
        const next = current.slice(0, display.length + 1);
        setDisplay(next);
        if (next === current) setIsPaused(true);
      } else {
        const next = current.slice(0, display.length - 1);
        setDisplay(next);
        if (next === '') {
          setIsDeleting(false);
          setWordIndex(i => (i + 1) % words.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);
    return () => clearTimeout(t);
  }, [display, isDeleting, isPaused, wordIndex, words, speed, deleteSpeed, pauseTime]);

  return display;
}

function StatCounter({ end, suffix, label, delay = 0 }: { end: number; suffix: string; label: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const start = setTimeout(() => {
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) { setCount(end); clearInterval(timer); }
        else setCount(Math.floor(current));
      }, duration / steps);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(start);
  }, [inView, end, delay]);

  return (
    <div ref={ref} style={{ textAlign: 'center', position: 'relative' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1,
          background: 'linear-gradient(135deg, white, var(--accent-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {count}{suffix}
      </div>
      <div
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.8rem',
          marginTop: '0.5rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function Hero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.5], ['0%', '-20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const typewriter = useTypewriter(ROLES);

  const letterContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.5 } },
  };
  const letterChild = {
    hidden: { opacity: 0, y: 80, rotateX: -90 },
    visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: 'spring' as const, damping: 12, stiffness: 120 } },
  };

  return (
    <section
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 8vw',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow blobs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-15%', right: '10%',
          width: '700px', height: '700px',
          background: 'radial-gradient(circle, rgba(107,70,193,0.25) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        style={{
          position: 'absolute', bottom: '0%', left: '-15%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }}
      />

      {/* Parallax background ghost text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.025 }}
        transition={{ duration: 2 }}
        style={{
          y, position: 'absolute', top: '5%', left: '-3%',
          fontSize: '22vw', whiteSpace: 'nowrap', zIndex: 0,
          fontFamily: 'var(--font-display)', fontWeight: 800,
          userSelect: 'none', letterSpacing: '-8px', color: 'white',
        }}
      >
        AI / REACT / SQL
      </motion.div>

      <motion.div style={{ y, opacity, zIndex: 10, position: 'relative' }}>

        {/* Greeting line */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: 'inline-block', width: '50px', height: '2px',
              background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
              transformOrigin: 'left',
            }}
          />
          <span style={{
            color: 'var(--accent-light)',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
          }}>
            Hello, I'm
          </span>
        </motion.div>

        {/* Name – letter by letter */}
        <div style={{ overflow: 'hidden', perspective: '800px' }}>
          <motion.h1
            variants={letterContainer}
            initial="hidden"
            animate="visible"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.5rem, 9.5vw, 9.5rem)',
              lineHeight: 0.88,
              letterSpacing: '-0.04em',
              margin: 0,
              display: 'flex',
              flexWrap: 'wrap',
            }}
            className="shimmer-text"
          >
            {'Sahar Refaei'.split('').map((char, i) => (
              <motion.span
                key={i}
                variants={letterChild}
                style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.h1>
        </div>

        {/* Typewriter role */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          style={{ marginTop: '1.8rem', height: '3.5rem', display: 'flex', alignItems: 'center' }}
        >
          <span
            style={{
              fontSize: 'clamp(1.3rem, 2.5vw, 2.2rem)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
            }}
          >
            {typewriter}
            <span style={{ animation: 'blink 1s step-end infinite', color: 'var(--accent-light)', marginLeft: '2px' }}>
              |
            </span>
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.4 }}
          style={{
            marginTop: '2rem',
            maxWidth: '480px',
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            lineHeight: 1.75,
          }}
        >
          MSc Artificial Intelligence · 5+ years building full-stack platforms, data pipelines, and AI systems at scale across Berlin and beyond.
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginTop: '3rem', maxWidth: '500px', transformOrigin: 'left' }}
        />

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          style={{ marginTop: '2rem', display: 'flex', gap: '4rem' }}
        >
          <StatCounter end={5} suffix="+" label="Years Exp." delay={0} />
          <StatCounter end={2} suffix="M+" label="Events / Day" delay={200} />
          <StatCounter end={3} suffix="" label="Companies" delay={400} />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        style={{
          position: 'absolute', bottom: '5vh', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
          color: 'var(--text-secondary)',
        }}
      >
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}>
          <ArrowDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}
