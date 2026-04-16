import { motion } from 'framer-motion';

const techRow1 = ['REACT & TYPESCRIPT', 'HIGH-SCALE BACKEND', 'AI / ML DEPLOYMENTS', 'JAVA SPRING BOOT', 'POSTGRESQL & ORM', 'CLOUD DEVOPS'];
const techRow2 = ['MICROSERVICES', 'DOCKER & KUBERNETES', 'REAL-TIME SYSTEMS', 'FULLSTACK ENGINEER', 'CI/CD AUTOMATION', 'NODE.JS & REST'];

const Dot = () => (
  <span style={{ color: 'var(--accent)', margin: '0 0.5rem', fontSize: '1.2rem', verticalAlign: 'middle' }}>◆</span>
);

function MarqueeRow({ items, direction = 1, speed = 18 }: { items: string[]; direction?: 1 | -1; speed?: number }) {
  const tripled = [...items, ...items, ...items];
  const distance = direction === 1 ? -2200 : 2200;

  return (
    <div style={{ overflow: 'hidden', display: 'flex' }}>
      <motion.div
        animate={{ x: [0, distance] }}
        transition={{ ease: 'linear', duration: speed, repeat: Infinity }}
        style={{ display: 'flex', width: 'fit-content', alignItems: 'center' }}
      >
        {tripled.map((t, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              letterSpacing: '0.06em',
            }}>
              {t}
            </span>
            <Dot />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div style={{
      width: '100vw',
      overflow: 'hidden',
      padding: '2.5rem 0',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      zIndex: 5,
      display: 'flex',
      flexDirection: 'column',
      gap: '1.2rem',
    }}>
      <MarqueeRow items={techRow1} direction={1} speed={22} />
      <MarqueeRow items={techRow2} direction={-1} speed={18} />
    </div>
  );
}
