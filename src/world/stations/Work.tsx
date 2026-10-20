import { education } from '../../content/profile'
import { experience, type Experience } from '../../content/experience'
import { projects, type Project } from '../../content/projects'
import { DetailTrigger } from '../../detail/DetailTrigger'
import { Anchor } from '../layout'
import { useAnchorMetrics, useLayout, useNearKf } from '../layoutCore'
import { keyframes, sectionStart } from '../path'
import { ProjectModel } from '../ProjectModels'
import { Panel, Title3D } from '../ui3d'

function EducationList() {
  return (
    <>
      <p className="wp__eyebrow wp__muted">Education</p>
      <ul style={{ marginTop: 8, display: 'grid', gap: 10 }}>
        {education.map((item) => (
          <li key={item.degree}>
            <strong>
              {item.degree} {item.field}
            </strong>
            <br />
            <span className="wp__muted">
              {item.school}
              {item.period ? ` · ${item.period}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}

function CompanyTitle({ text }: { text: string }) {
  const { visibleW } = useAnchorMetrics()
  const { narrow } = useLayout()
  return (
    <Title3D
      text={text}
      size={visibleW * (narrow ? 0.14 : 0.085)}
      maxWidth={visibleW * (narrow ? 0.88 : 0.46)}
      look="chrome"
      depth={visibleW * 0.015}
      align="center"
    />
  )
}

function GhostTitle({ text }: { text: string }) {
  const { visibleW } = useAnchorMetrics()
  return <Title3D text={text} size={visibleW * 0.2} look="ghost" depth={visibleW * 0.03} />
}

function JobStop({ job, kf, index }: { job: Experience; kf: number; index: number }) {
  const { narrow } = useLayout()
  const side = index % 2 ? 1 : -1
  const last = index === experience.length - 1
  return (
    <>
      <Anchor kf={kf} desktop={[side * 0.34, 0.5, 13]} narrow={[0, 0.58, 12]} range={1.5}>
        <CompanyTitle text={job.shortName} />
      </Anchor>

      <Anchor kf={kf} desktop={[side * 0.34, -0.2, 10.5]} narrow={[0, -0.12, 9]} range={1.3}>
        <Panel px={narrow ? 330 : 430} frac={narrow ? 0.94 : 0.34} theme="ink" className="has-detail">
          <h2 className="sr-only">{job.company}</h2>
          <p className="wp__eyebrow wp__muted">
            {job.current ? <span className="wp__now">Now</span> : null}
            {job.period} · {job.company}
          </p>
          <p className="wp__lead" style={{ marginTop: 8 }}>
            {job.role}
          </p>
          <p className="wp__muted" style={{ marginTop: 4, fontSize: 14 }}>
            {job.location}
          </p>
          <p style={{ marginTop: 12 }}>{job.summary}</p>
          <ul className="wp__chips" aria-label={`Technologies at ${job.company}`}>
            {job.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <DetailTrigger to={{ kind: 'experience', id: job.id }} label={`${job.role} at ${job.company}`} />
          {last && narrow ? (
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1.5px solid currentColor' }}>
              <EducationList />
            </div>
          ) : null}
        </Panel>
      </Anchor>

      {last && !narrow ? (
        <Anchor kf={kf} desktop={[-side * 0.4, -0.2, 10.5]} range={1.3}>
          <Panel px={340} frac={0.26} theme="ink">
            <EducationList />
          </Panel>
        </Anchor>
      ) : null}

      {index === 0 ? (
        <Anchor kf={kf} desktop={[0, 0.62, 30]} narrow={[0, 0.5, 30]} range={2.2}>
          <GhostTitle text="WORK" />
        </Anchor>
      ) : null}
    </>
  )
}

/** A glowing spine running down the corridor with a node at every role. */
function Spine() {
  const first = sectionStart.experience
  const last = first + experience.length - 1
  const near = useNearKf((first + last) / 2, experience.length / 2 + 1.4)
  const z0 = keyframes[first].pos.z - 9
  const z1 = keyframes[last].pos.z - 9
  const length = z0 - z1
  return (
    <group position={[0, -2.1, 0]} visible={near}>
      <mesh position={[0, 0, (z0 + z1) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, length, 8]} />
        <meshBasicMaterial color="#ff5a1f" />
      </mesh>
      {experience.map((_, j) => (
        <mesh key={j} position={[0, 0, keyframes[first + j].pos.z - 9]}>
          <sphereGeometry args={[0.26, 24, 24]} />
          <meshStandardMaterial color="#ff5a1f" emissive="#ff3d8b" emissiveIntensity={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function ExperienceStation() {
  const first = sectionStart.experience
  return (
    <>
      <Spine />
      {experience.map((job, j) => (
        <JobStop key={job.id} job={job} kf={first + j} index={j} />
      ))}
    </>
  )
}

function ScaledModel({ kind }: { kind: Project['visual'] }) {
  const { visibleW } = useAnchorMetrics()
  const { narrow } = useLayout()
  return (
    <group scale={((narrow ? 0.62 : 0.27) * visibleW) / 2.6}>
      <ProjectModel kind={kind} />
    </group>
  )
}

function ProjectStop({ project, kf, index }: { project: Project; kf: number; index: number }) {
  const { narrow } = useLayout()
  const side = index % 2 ? -1 : 1
  return (
    <>
      <Anchor kf={kf} desktop={[-side * 0.3, 0.02, 11.5]} narrow={[0, 0.5, 10.5]} range={1.5}>
        <ScaledModel kind={project.visual} />
      </Anchor>

      <Anchor kf={kf} desktop={[side * 0.34, 0, 10]} narrow={[0, -0.34, 9]} range={1.3}>
        <Panel px={narrow ? 330 : 430} frac={narrow ? 0.94 : 0.34} theme="heat" className="has-detail">
          <p className="wp__eyebrow">
            {String(index + 1).padStart(2, '0')} · {project.kind}
          </p>
          <h2 className="wp__h" style={{ marginTop: 8 }}>
            {project.title}
          </h2>
          <p style={{ marginTop: 12, fontWeight: 500 }}>{project.description}</p>
          <ul className="wp__chips" aria-label={`Technologies used in ${project.title}`}>
            {project.tech.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <DetailTrigger to={{ kind: 'project', id: project.id }} label={project.title} />
          {project.github || project.live ? (
            <ul className="wp__links">
              {project.github ? (
                <li>
                  <a className="pill pill--solid" href={project.github} target="_blank" rel="noopener noreferrer">
                    GitHub <span aria-hidden="true">↗</span>
                    <span className="sr-only"> repository for {project.title} (opens in a new tab)</span>
                  </a>
                </li>
              ) : null}
              {project.live ? (
                <li>
                  <a className="pill" href={project.live} target="_blank" rel="noopener noreferrer">
                    Live demo <span aria-hidden="true">↗</span>
                    <span className="sr-only"> of {project.title} (opens in a new tab)</span>
                  </a>
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="wp__eyebrow" style={{ marginTop: 14 }}>
              No public repository
            </p>
          )}
        </Panel>
      </Anchor>

      {index === 0 ? (
        <Anchor kf={kf} desktop={[0, 0.66, 30]} narrow={[0, 0.52, 30]} range={2.2}>
          <GhostTitle text="PROJECTS" />
        </Anchor>
      ) : null}
    </>
  )
}

export function ProjectsStation() {
  const first = sectionStart.projects
  return (
    <>
      {projects.map((project, j) => (
        <ProjectStop key={project.id} project={project} kf={first + j} index={j} />
      ))}
    </>
  )
}
