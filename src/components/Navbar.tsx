import { motion, useScroll, useSpring } from 'framer-motion';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Expertise', href: '#expertise' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '1.2rem 8vw',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(3, 3, 3, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : 'none',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}
    >
      {/* Logo */}
      <motion.a
        href="#"
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '2px' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'white', letterSpacing: '-0.03em' }}>
          SR
        </span>
        <span style={{ color: 'var(--accent)', fontSize: '2rem', lineHeight: 1 }}>.</span>
      </motion.a>

      {/* Nav links */}
      <div className="nav-links" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        {NAV_LINKS.map((link, i) => (
          <motion.a
            key={link.href}
            href={link.href}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.88rem',
              letterSpacing: '0.05em',
              cursor: 'none',
              position: 'relative',
            }}
            whileHover={{ color: 'white', y: -1 }}
          >
            <motion.span
              style={{ position: 'absolute', bottom: '-4px', left: 0, height: '1px', background: 'var(--accent-light)', originX: 0 }}
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.25 }}
            />
            {link.label}
          </motion.a>
        ))}
      </div>

      {/* Scroll progress bar */}
      <motion.div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '1.5px',
          background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
          scaleX,
          transformOrigin: '0%',
        }}
      />
    </motion.nav>
  );
}
