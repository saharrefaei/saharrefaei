import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { DotText } from '../components/DotText'
import { FadeUp } from '../components/motion'
import { SectionHead } from '../components/SectionHead'
import { education } from '../content/profile'
import { experience } from '../content/experience'
import { DetailTrigger } from '../detail/DetailTrigger'
import './Experience.css'

export function Experience() {
  const listRef = useRef<HTMLOListElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.65', 'end 0.6'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 })

  return (
    <section id="experience" className="section on-ink experience" data-scene-section aria-labelledby="experience-title">
      <div className="container experience__layout">
        <div className="experience__intro">
          <SectionHead index="02" label="Experience" titleId="experience-title" titleLines={['Work &', 'research']} tone="ink" />
          <FadeUp>
            <p className="experience__lede">
              From operator dashboards and data pipelines to federated-learning research — and now product engineering at Taxfix.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="education">
              <h3 className="eyebrow">Education</h3>
              <ul>
                {education.map((item) => (
                  <li className="education__item" key={item.degree}>
                    <span className="education__degree display">{item.degree}</span>
                    <span>
                      <strong>{item.field}</strong>
                      <br />
                      <span className="education__school">
                        {item.school}
                        {item.period ? ` · ${item.period}` : ''}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>

        <div className="timeline-wrap">
          <div className="timeline__rail" aria-hidden="true">
            <motion.span className="timeline__rail-fill" style={{ scaleY: reduced ? 1 : progress }} />
          </div>
          <ol className="timeline" ref={listRef}>
            {experience.map((job, index) => (
              <li className="job" key={job.id} id={`experience-${job.id}`}>
                <motion.span
                  className="job__node"
                  aria-hidden="true"
                  initial={reduced ? false : { scale: 0.3, opacity: 0.4 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '0px 0px -35% 0px' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  data-current={job.current ? 'true' : undefined}
                />
                <FadeUp className="job__body has-detail" as="article">
                  <div className="job__top">
                    <DotText
                      text={String(index + 1).padStart(2, '0')}
                      label=""
                      pitch={3}
                      color="#ff5a1f"
                      offColor="rgba(255, 250, 246, 0.14)"
                      interactive={false}
                    />
                    <p className="job__period eyebrow">
                      {job.current ? <span className="job__now">Now</span> : null}
                      {job.period}
                    </p>
                  </div>
                  <h3 className="job__company display">{job.company}</h3>
                  <p className="job__role">
                    {job.role} <span aria-hidden="true">·</span> {job.location}
                  </p>
                  <p className="job__summary">{job.summary}</p>
                  <ul className="job__stack" aria-label={`Technologies at ${job.company}`}>
                    {job.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <DetailTrigger to={{ kind: 'experience', id: job.id }} label={`${job.role} at ${job.company}`} />
                </FadeUp>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
