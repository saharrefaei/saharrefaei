import type { ReactNode, RefObject } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { GalleryImage, Impact } from '../content/detail'
import { ProjectVisual } from '../components/ProjectVisual'
import { detail } from './detailStore'
import type { Block, DetailModel } from './model'
import { detailPath, type DetailRef } from './routes'

const EASE = [0.16, 1, 0.3, 1] as const

/** Fades and lifts a block in as it scrolls into view *inside the overlay's own scroller*. */
export function Reveal({
  scroller,
  children,
  className,
  delay = 0,
}: {
  scroller: RefObject<HTMLElement | null>
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 32 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ root: scroller, once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: reduced ? 0.2 : 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/** A link to another detail view that swaps in place (no new history entry) and stays a real, copyable URL. */
export function DetailLink({ to, className, children }: { to: DetailRef; className?: string; children: ReactNode }) {
  return (
    <a
      className={className}
      href={detailPath(to)}
      onClick={(event) => {
        // let modified clicks (new tab, etc.) behave like any link
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
        event.preventDefault()
        detail.swap(to)
      }}
    >
      {children}
    </a>
  )
}

export function TechnologyList({ heading, items }: { heading: string; items: string[] }) {
  return (
    <section className="dtech" aria-label={heading}>
      <h2 className="eyebrow dside__label">{heading}</h2>
      <ul className="dtech__list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export function ImpactMetrics({ impact }: { impact: Impact }) {
  return (
    <div className="dimpact">
      {impact.metrics && impact.metrics.length > 0 ? (
        <ul className="dimpact__metrics">
          {impact.metrics.map((metric) => (
            <li key={metric.label}>
              <span className="dimpact__value display">{metric.value}</span>
              <span className="dimpact__label">{metric.label}</span>
              {metric.note ? <span className="dimpact__note">{metric.note}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {impact.notes && impact.notes.length > 0 ? (
        <ul className="dlist">
          {impact.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** Real screenshots only. Loaded lazily and decoded off the main thread. */
export function ProjectGallery({ items }: { items: GalleryImage[] }) {
  return (
    <ul className="dgallery">
      {items.map((image) => (
        <li key={image.src}>
          <figure>
            <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" />
            {image.caption ? <figcaption>{image.caption}</figcaption> : null}
          </figure>
        </li>
      ))}
    </ul>
  )
}

export function SectionBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraphs':
      return (
        <div className="dprose">
          {block.items.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
      )
    case 'list':
      return (
        <ul className="dlist">
          {block.items.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )
    case 'cards':
      return (
        <ul className="dcards">
          {block.items.map((card) => (
            <li key={card.title} className="dcard">
              <h3 className="dcard__title">{card.title}</h3>
              <p>{card.body}</p>
              {card.ref ? (
                <DetailLink to={card.ref} className="dcard__link">
                  Read the project <span aria-hidden="true">→</span>
                  <span className="sr-only">: {card.title}</span>
                </DetailLink>
              ) : null}
            </li>
          ))}
        </ul>
      )
    case 'challenges':
      return (
        <ul className="dpairs">
          {block.items.map((pair) => (
            <li key={pair.challenge} className="dpair">
              <p className="dpair__challenge">
                <span className="eyebrow">Challenge</span>
                {pair.challenge}
              </p>
              <p className="dpair__solution">
                <span className="eyebrow">Solution</span>
                {pair.solution}
              </p>
            </li>
          ))}
        </ul>
      )
    case 'impact':
      return <ImpactMetrics impact={block.impact} />
    case 'gallery':
      return <ProjectGallery items={block.items} />
  }
}

/** Title block: position, oversized heading, lede, facts and (for projects) the generated artwork. */
export function DetailHeader({ model, titleId }: { model: DetailModel; titleId: string }) {
  const reduced = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 40 },
    animate: reduced ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0.2 : 0.9, ease: EASE, delay: reduced ? 0 : delay },
  })
  return (
    <header className="dhead">
      <span className="dhead__index display" aria-hidden="true">
        {String(model.index + 1).padStart(2, '0')}
      </span>
      <div className="dhead__text">
        {model.current ? (
          <motion.p className="eyebrow dhead__position" {...rise(0.25)}>
            <span className="dnow">Now</span>
            Current role
          </motion.p>
        ) : null}
        <motion.h1 className="display dhead__title" id={titleId} {...rise(0.32)}>
          {model.title}
        </motion.h1>
        <motion.p className="dhead__lede" {...rise(0.42)}>
          {model.lede}
        </motion.p>
        <motion.dl className="dfacts" {...rise(0.5)}>
          {model.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="eyebrow">{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
      {model.visual ? (
        <motion.div className="dhead__art" {...rise(0.4)}>
          <ProjectVisual kind={model.visual.kind} labels={model.visual.labels} />
          <span className="dhead__art-note eyebrow">Illustration</span>
        </motion.div>
      ) : null}
    </header>
  )
}

export function DetailPager({ model }: { model: DetailModel }) {
  const noun = model.ref.kind === 'project' ? 'project' : 'role'
  return (
    <nav className="dpager" aria-label={`More ${noun}s`}>
      <DetailLink to={model.prev.ref} className="dpager__link">
        <span className="eyebrow">
          <span aria-hidden="true">←</span> Previous {noun}
        </span>
        <span className="dpager__title display">{model.prev.title}</span>
      </DetailLink>
      <DetailLink to={model.next.ref} className="dpager__link dpager__link--next">
        <span className="eyebrow">
          Next {noun} <span aria-hidden="true">→</span>
        </span>
        <span className="dpager__title display">{model.next.title}</span>
      </DetailLink>
    </nav>
  )
}
