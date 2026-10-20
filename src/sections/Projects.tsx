import { useEffect, useRef, useState } from 'react'
import { DotText } from '../components/DotText'
import { FadeUp } from '../components/motion'
import { ProjectVisual } from '../components/ProjectVisual'
import { SectionHead } from '../components/SectionHead'
import { projects } from '../content/projects'
import { DetailTrigger } from '../detail/DetailTrigger'
import './Projects.css'

/** Active project follows scroll position; hover and keyboard focus override it. */
function useActiveProject(listRef: React.RefObject<HTMLOListElement | null>) {
  const [activeId, setActiveId] = useState(projects[0].id)

  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('[data-project-id]')
    if (!items) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId((entry.target as HTMLElement).dataset.projectId ?? projects[0].id)
        }
      },
      { rootMargin: '-42% 0px -50% 0px' },
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [listRef])

  return [activeId, setActiveId] as const
}

export function Projects() {
  const listRef = useRef<HTMLOListElement>(null)
  const [activeId, setActiveId] = useActiveProject(listRef)
  const activeIndex = Math.max(
    0,
    projects.findIndex((project) => project.id === activeId),
  )
  const active = projects[activeIndex]

  return (
    <section id="projects" className="section on-heat projects" data-scene-section aria-labelledby="projects-title">
      <div className="container">
        <SectionHead index="03" label="Selected projects" titleId="projects-title" titleLines={['Selected', 'projects']} tone="heat" />

        <div className="projects__layout">
          <ol className="projects__list" ref={listRef}>
            {projects.map((project, index) => (
              <li
                key={project.id}
                id={`project-${project.id}`}
                className="project"
                data-project-id={project.id}
                data-active={project.id === active.id ? 'true' : undefined}
                onPointerEnter={() => setActiveId(project.id)}
                onFocus={() => setActiveId(project.id)}
              >
                <FadeUp className="project__inner has-detail" as="article">
                  <div className="project__visual-inline" aria-hidden="true">
                    <ProjectVisual kind={project.visual} labels={project.visualLabels} />
                  </div>
                  <p className="project__kind eyebrow">
                    <span className="project__num">{String(index + 1).padStart(2, '0')}</span>
                    {project.kind}
                    {project.year ? ` · ${project.year}` : ''}
                  </p>
                  <h3 className="project__title display">{project.title}</h3>
                  <p className="project__description">{project.description}</p>
                  <ul className="project__tech" aria-label={`Technologies used in ${project.title}`}>
                    {project.tech.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <DetailTrigger to={{ kind: 'project', id: project.id }} label={project.title} />
                  {project.github || project.live ? (
                    <ul className="project__links">
                      {project.github ? (
                        <li>
                          <a className="pill pill--solid" href={project.github} target="_blank" rel="noopener noreferrer">
                            GitHub <span className="arrow" aria-hidden="true">↗</span>
                            <span className="sr-only">
                              {' '}
                              repository for {project.title} (opens in a new tab)
                            </span>
                          </a>
                        </li>
                      ) : null}
                      {project.live ? (
                        <li>
                          <a className="pill" href={project.live} target="_blank" rel="noopener noreferrer">
                            Live demo <span className="arrow" aria-hidden="true">↗</span>
                            <span className="sr-only">
                              {' '}
                              of {project.title} (opens in a new tab)
                            </span>
                          </a>
                        </li>
                      ) : null}
                    </ul>
                  ) : (
                    <p className="project__note eyebrow">No public repository</p>
                  )}
                </FadeUp>
              </li>
            ))}
          </ol>

          <aside className="projects__preview" aria-hidden="true">
            <div className="preview">
              <div className="preview__stage">
                {projects.map((project) => (
                  <div className="preview__art" key={project.id} data-active={project.id === active.id ? 'true' : undefined}>
                    <ProjectVisual kind={project.visual} labels={project.visualLabels} />
                  </div>
                ))}
              </div>
              <div className="preview__caption">
                <DotText
                  text={String(activeIndex + 1).padStart(2, '0')}
                  label=""
                  pitch={4}
                  color="#14080f"
                  offColor="rgba(20, 8, 15, 0.2)"
                  interactive={false}
                  reveal={false}
                />
                <span className="preview__title">{active.title}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
