import { OrbRig } from '../../scene/OrbRig'
import { about, links, profile } from '../../content/profile'
import { Anchor } from '../layout'
import { useAnchorMetrics, useLayout } from '../layoutCore'
import { Panel, Title3D } from '../ui3d'

/** The orb at a given on-screen size (fraction of the visible width at its distance). */
export function Orb({ frac }: { frac: number }) {
  const { visibleW } = useAnchorMetrics()
  const { lowPower } = useLayout()
  return (
    <group scale={(frac * visibleW) / 6.7}>
      <OrbRig lowPower={lowPower} reducedMotion={false} />
    </group>
  )
}

function HeroName() {
  const { visibleW } = useAnchorMetrics()
  const { narrow } = useLayout()
  const em = visibleW * (narrow ? 0.27 : 0.17)
  // The gap between the two lines is where the camera flies through on its way to About.
  return (
    <>
      <group position={[0, em * 0.66, 0]}>
        <Title3D text="SAHAR" size={em} look="ink" depth={em * 0.22} />
      </group>
      <group position={[0, -em * 0.66, 0]}>
        <Title3D text="REFAEI" size={em} look="ink" depth={em * 0.22} />
      </group>
    </>
  )
}

export function HeroStation() {
  const { narrow } = useLayout()
  return (
    <>
      <Anchor kf={0} desktop={[0, 0.2, 12]} narrow={[0, 0.2, 12]} range={2.4}>
        <HeroName />
      </Anchor>

      <Anchor kf={0} desktop={[-0.44, -0.74, 11]} narrow={[0, -0.6, 11]} range={1.4}>
        <Panel px={narrow ? 330 : 520} frac={narrow ? 0.94 : 0.4} theme="paper">
          <p className="wp__eyebrow wp__muted">{profile.location}</p>
          <p className="wp__lead" style={{ marginTop: 6 }}>
            {profile.role} · {profile.focus}
          </p>
          <p style={{ marginTop: 8 }}>{profile.tagline}</p>
          <ul className="wp__links">
            <li>
              <a className="pill pill--solid" href="#projects">
                Projects <span aria-hidden="true">↓</span>
              </a>
            </li>
            <li>
              <a className="pill" href={links.github} target="_blank" rel="noopener noreferrer">
                GitHub <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a className="pill" href={links.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a className="pill" href="#contact">
                Contact <span aria-hidden="true">↓</span>
              </a>
            </li>
          </ul>
        </Panel>
      </Anchor>

      <Anchor kf={0} desktop={[0.62, 0.62, 19]} narrow={[0.2, 0.78, 20]} range={2}>
        <Orb frac={narrow ? 0.7 : 0.3} />
      </Anchor>
    </>
  )
}

function AboutTitle() {
  const { visibleW } = useAnchorMetrics()
  return <Title3D text="ABOUT" size={visibleW * 0.15} look="ink" depth={visibleW * 0.03} />
}

function GhostWord({ text, k }: { text: string; k: number }) {
  const { visibleW } = useAnchorMetrics()
  return <Title3D text={text} size={visibleW * k} look="ghostInk" depth={visibleW * 0.02} />
}

export function AboutStation() {
  const { narrow } = useLayout()
  return (
    <>
      <Anchor kf={1} desktop={[-0.46, 0.6, 15]} narrow={[0, 0.74, 14]} range={1.6}>
        <AboutTitle />
      </Anchor>

      <Anchor kf={1} desktop={[0.36, -0.04, 11]} narrow={[0, -0.12, 9.5]} range={1.4}>
        <Panel px={narrow ? 330 : 520} frac={narrow ? 0.94 : 0.44} theme="paper">
          <h2>Engineer by craft. AI by direction.</h2>
          <p className="wp__lead" style={{ marginTop: 14, fontSize: narrow ? 19 : 22 }}>
            {about.statement}
          </p>
          <dl className="wp__facts">
            {about.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="wp__eyebrow">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </Anchor>

      {narrow ? null : (
        <Anchor kf={1} desktop={[-0.46, -0.42, 11]} range={1.2}>
          <Panel px={380} frac={0.28} theme="paper">
            <p className="wp__muted">{about.paragraph}</p>
          </Panel>
        </Anchor>
      )}

      {/* oversized words further down the corridor: they sweep past as the camera moves on */}
      <Anchor kf={1} desktop={[-0.15, -0.5, 30]} narrow={[0, -0.4, 30]} range={1.6}>
        <GhostWord text="FRONTEND" k={0.17} />
      </Anchor>
      <Anchor kf={1} desktop={[0.3, 0.6, 40]} narrow={[0, 0.5, 40]} range={1.8}>
        <GhostWord text="APPLIED AI" k={0.17} />
      </Anchor>
      {narrow ? null : (
        <Anchor kf={1} desktop={[0.8, 0.62, 20]} range={1.6}>
          <Orb frac={0.16} />
        </Anchor>
      )}
    </>
  )
}
