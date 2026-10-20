import { useEffect, useId, useMemo, useRef, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { DetailHeader, DetailLink, DetailPager, Reveal, SectionBlock, TechnologyList } from './blocks'
import { detail, useDetail, type DetailOrigin } from './detailStore'
import { buildModel, type DetailModel } from './model'
import './detail.css'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
const EASE = [0.16, 1, 0.3, 1] as const

const reach = (o: DetailOrigin) =>
  Math.hypot(Math.max(o.x, window.innerWidth - o.x), Math.max(o.y, window.innerHeight - o.y)) + 4
const iris = (o: DetailOrigin, r: number) => `circle(${r}px at ${o.x}px ${o.y}px)`

/**
 * The full-screen editorial view for one project or job. Everything about *behaviour* that must work
 * before this chunk has loaded (scroll lock, inert background, pausing the 3D scene, restoring focus
 * and scroll) lives in DetailHost; this component is the presentation and the dialog's own keyboard
 * handling.
 */
export default function DetailOverlay() {
  const { ref, origin } = useDetail()
  const model = useMemo(() => (ref ? buildModel(ref) : null), [ref])
  const reduced = useReducedMotion()
  const titleId = useId()
  const dialog = useRef<HTMLDivElement>(null)

  // entering: the view opens as an iris from where it was clicked (or the centre, e.g. for a deep link)
  const from = origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }

  // Whenever an item is shown (opened, or another one swapped in): back to the top, and focus on the
  // dialog itself, so screen readers announce the new title and Escape keeps working even though the
  // link that was just activated has been replaced.
  useEffect(() => {
    if (!model) return
    dialog.current?.scrollTo({ top: 0, behavior: 'instant' })
    dialog.current?.focus({ preventScroll: true })
  }, [model])

  // history entries and shared links get a meaningful tab title
  useEffect(() => {
    if (!model) return
    const previous = document.title
    document.title = `${model.title} · Sahar Refaei`
    return () => {
      document.title = previous
    }
  }, [model])

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      detail.close()
      return
    }
    if (event.key !== 'Tab') return
    const items = [...(dialog.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === dialog.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <AnimatePresence>
      {ref && model ? (
        <motion.div
          key="detail"
          ref={dialog}
          className="detail"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          initial={reduced ? { opacity: 0 } : { clipPath: iris(from, 0) }}
          animate={reduced ? { opacity: 1 } : { clipPath: iris(from, reach(from)) }}
          exit={reduced ? { opacity: 0 } : { clipPath: [iris(from, reach(from)), iris(from, 0)] }}
          transition={{ duration: reduced ? 0.2 : 0.75, ease: EASE }}
          // At rest the layer needs no mask (see .detail[data-settled]), so scrolling and text stay on the
          // fast path. Set imperatively: an exiting element is frozen at its last render, and the exit
          // iris has to start masked again.
          onAnimationStart={() => dialog.current?.removeAttribute('data-settled')}
          onAnimationComplete={() => dialog.current?.setAttribute('data-settled', '')}
        >
          <div className="detail__glow" aria-hidden="true" />

          <div className="detail__bar">
            <p className="eyebrow detail__crumb">{model.position}</p>
            <button type="button" className="pill detail__close" onClick={detail.close}>
              Close <span aria-hidden="true">✕</span>
              <kbd className="detail__kbd" aria-hidden="true">
                Esc
              </kbd>
            </button>
          </div>

          <article className="detail__content" key={`${model.ref.kind}:${model.ref.id}`}>
            <DetailHeader model={model} titleId={titleId} />

            <DetailBody model={model} scroller={dialog} />

            <DetailPager model={model} />
          </article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function DetailBody({ model, scroller }: { model: DetailModel; scroller: RefObject<HTMLElement | null> }) {
  return (
    <div className="dbody">
      <aside className="dside">
        <Reveal scroller={scroller}>
          <TechnologyList heading={model.tech.heading} items={model.tech.items} />
        </Reveal>
        {model.links.length > 0 ? (
          <Reveal scroller={scroller} delay={0.05}>
            <ul className="dside__links" aria-label="Links">
              {model.links.map((link) => (
                <li key={link.href}>
                  <a className="pill pill--solid" href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label} <span className="arrow" aria-hidden="true">↗</span>
                    <span className="sr-only"> {link.hint} (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
        {model.related ? (
          <Reveal scroller={scroller} delay={0.1}>
            <p className="dside__related">
              <DetailLink to={model.related.ref} className="dside__related-link">
                {model.related.label} <span aria-hidden="true">→</span>
              </DetailLink>
            </p>
          </Reveal>
        ) : null}
      </aside>

      <div className="dmain">
        {model.sections.map((section, index) => (
          <Reveal key={section.id} scroller={scroller} className="dsec">
            <section aria-labelledby={`dsec-${section.id}`}>
              <h2 className="dsec__heading" id={`dsec-${section.id}`}>
                <span className="dsec__num eyebrow" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {section.heading}
              </h2>
              <SectionBlock block={section.block} />
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
