import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const experiences = [
  {
    index: "01",
    role: "Software & Data Engineer",
    company: "Almedia GmbH",
    location: "Berlin, Germany",
    date: "Jun 2025 — Present",
    color: "#6b46c1",
    current: true,
    highlights: [
      "540× performance improvement on billing endpoints — reduced page load from ~2.7s to ~5ms via async httpx, connection pooling, and caching",
      "Designed provider-facing Adjust Aggregated Cost API with BigQuery/Dataform models, SHA256-based API key auth, rate limiting, and multi-dimensional reporting",
      "Built Billing Entities system end-to-end (backend, frontend, HubSpot sync, tax ID lifecycle, Slack notifications, full billing UI)",
      "Extended HubSpot ↔ BigQuery sync service with 3 custom objects and 3.4K+ records synced (offer_countries, offer_event_bids, offer_caps)",
      "Stabilized AppsFlyer cost pipeline with bounded concurrency, retry logic, polling, and job state tracking (pending/failed/applied)",
      "Developed reusable AppsFlyer backfill CLI tool — auto-detects affected apps, validates capability, sends batched rate-limited requests",
      "Delivered 62+ PRs: Game Budgets feature, feature flag improvements, Slack service centralization, security enhancements",
    ],
  },
  {
    index: "02",
    role: "AI Engineer (Research)",
    company: "BTU Cottbus",
    location: "Cottbus, Germany",
    date: "Mar 2023 — Jun 2025",
    color: "#0ea5e9",
    current: false,
    highlights: [
      "Designed federated learning framework using Vision Transformers (ViT) with early-exit architecture for 20+ heterogeneous clients",
      "Implemented mask-aware federated aggregation — averaging only client-updated parameters across shared global model",
      "Developed complexity-aware routing using entropy and confidence metrics for adaptive depth selection",
      "Achieved 62.5% global accuracy, outperforming the full-model baseline by ~1% and boosting mean client accuracy by 3%",
      "Evaluated model behavior under varying system constraints and data distributions, increasing global accuracy to 12.6% over extended runs",
    ],
  },
  {
    index: "03",
    role: "Software Developer",
    company: "50Hertz Transmission GmbH",
    location: "Berlin, Germany",
    date: "Mar 2023 — Jun 2025",
    color: "#f59e0b",
    current: false,
    highlights: [
      "Engineered scalable mission-critical dashboard with React, Python, and MongoDB for 10+ power grid operators",
      "Integrated robust CI/CD pipeline into Kubernetes, increasing team productivity by 40%",
      "Crafted 5+ FastAPI and REST APIs in Python for efficient real-time client data requests",
      "Designed 10+ interactive interfaces using Framer Motion, MUI, CSS, and TypeScript",
      "Deployed and optimized scalable cloud solutions on AWS, improving infrastructure efficiency by 35%",
      "Refactored modular code architecture, reducing registration and onboarding time by 48%",
    ],
  },
  {
    index: "04",
    role: "Data Engineer",
    company: "Part Software Group",
    location: "Mashhad, Iran",
    date: "Jan 2019 — Dec 2021",
    color: "#10b981",
    current: false,
    highlights: [
      "Built intuitive user interfaces with Vue.js, Node.js, and PostgreSQL — achieving 90% success rate in issue resolution",
      "Enhanced database efficiency by 20% through optimized bash script testing and query tuning",
      "Managed and optimized product databases — secured 95% success rate in automated backups and data recovery",
      "Documented workflows and internal processes, boosting team onboarding efficiency by 40%",
    ],
  },
];

function TimelineCard({ exp, index }: { exp: (typeof experiences)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="timeline-row"
      style={{
        display: "grid",
        gridTemplateColumns: "clamp(80px, 12vw, 160px) 28px 1fr",
        gap: "0 1rem",
        marginBottom: index === experiences.length - 1 ? 0 : "3rem",
        alignItems: "flex-start",
        minWidth: 0,
      }}
    >
      {/* Date column */}
      <div className="timeline-date" style={{ textAlign: "right", paddingTop: "1.4rem" }}>
        <div style={{ color: exp.color, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.06em", lineHeight: 1.4 }}>
          {exp.date.split(" — ").join("\n—\n").split("\n").map((part, i) => (
            <span key={i} style={{ display: "block" }}>{part}</span>
          ))}
        </div>
        {exp.current && (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              background: `${exp.color}15`, border: `1px solid ${exp.color}40`,
              borderRadius: "20px", padding: "2px 8px",
              fontSize: "0.68rem", color: exp.color, marginTop: "6px",
            }}
          >
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: exp.color, display: "inline-block" }} />
            Now
          </motion.span>
        )}
      </div>

      {/* Dot + line column */}
      <div className="timeline-dot-col" style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "1.2rem" }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            width: "14px", height: "14px", borderRadius: "50%",
            background: exp.color, flexShrink: 0, zIndex: 2,
            boxShadow: `0 0 16px ${exp.color}80`,
            border: `2px solid ${exp.color}`,
          }}
        />
        {index < experiences.length - 1 && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            style={{
              width: "1px", flex: 1, minHeight: "60px", marginTop: "6px",
              background: `linear-gradient(to bottom, ${exp.color}60, ${experiences[index + 1].color}40)`,
              transformOrigin: "top",
            }}
          />
        )}
      </div>

      {/* Card */}
      <motion.div
        className="glass-panel"
        whileHover={{ borderColor: `${exp.color}40`, boxShadow: `0 0 30px ${exp.color}10` }}
        style={{
          padding: "2rem 2.5rem",
          borderLeft: `2px solid ${exp.color}50`,
          cursor: "default",
        }}
      >
        {/* Date shown inside card on mobile */}
        <div className="timeline-date-mobile" style={{ display: "none", color: exp.color, fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.5rem", letterSpacing: "0.06em" }}>
          {exp.date} · {exp.location}
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.6rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 2vw, 1.7rem)", color: "white", lineHeight: 1.1 }}>
            {exp.company}
          </h3>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
            {exp.location}
          </span>
        </div>
        <p style={{ color: exp.color, fontSize: "0.9rem", fontWeight: 500, marginBottom: "1.5rem", letterSpacing: "0.02em" }}>
          {exp.role}
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {exp.highlights.map((h, i) => (
            <li key={i} style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start" }}>
              <span style={{ color: exp.color, marginTop: "5px", flexShrink: 0, fontSize: "0.6rem" }}>◆</span>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>{h}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

export default function ExperienceScroll() {
  return (
    <section id="experience" style={{ padding: "12vh 8vw 8vh", position: "relative" }}>

      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "10%", right: "-10%",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(107,70,193,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: "4rem", maxWidth: "1200px", margin: "0 auto 4rem" }}
      >
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          style={{
            color: "var(--accent-light)", letterSpacing: "0.3em",
            textTransform: "uppercase", fontSize: "0.85rem", marginBottom: "1.2rem",
            display: "flex", alignItems: "center", gap: "1rem",
          }}
        >
          <span style={{ display: "inline-block", width: "30px", height: "1px", background: "var(--accent-light)" }} />
          Career
        </motion.p>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(3rem, 6vw, 5rem)",
          lineHeight: 0.95, letterSpacing: "-0.03em", color: "white",
        }}>
          Work Journey
        </h2>
      </motion.div>

      {/* Timeline */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
        {experiences.map((exp, i) => (
          <TimelineCard key={exp.index} exp={exp} index={i} />
        ))}
      </div>
    </section>
  );
}
