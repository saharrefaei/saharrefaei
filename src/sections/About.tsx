import { FadeUp, ScrollBand, ScrollWords } from '../components/motion'
import { SectionHead } from '../components/SectionHead'
import { about } from '../content/profile'
import './About.css'

export function About() {
  return (
    <section id="about" className="section on-paper about" data-scene-section aria-labelledby="about-title">
      <ScrollBand
        rows={[
          { text: 'Frontend', direction: 1 },
          { text: 'Applied AI', direction: -1 },
        ]}
      />

      <div className="container about__body">
        <SectionHead
          index="01"
          label="About"
          titleId="about-title"
          titleLines={['Engineer by craft.', 'AI by direction.']}
          tone="paper"
        />

        <ScrollWords className="about__statement" text={about.statement} />

        <div className="about__detail">
          <FadeUp>
            <p className="about__paragraph">{about.paragraph}</p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <dl className="about__facts">
              {about.facts.map((fact) => (
                <div className="about__fact" key={fact.label}>
                  <dt className="eyebrow">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
