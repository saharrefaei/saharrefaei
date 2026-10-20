import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { events } from '../content/events'
import { lightbox, useLightbox } from '../world/lightboxStore'
import './Lightbox.css'

const FOCUSABLE = 'button:not([tabindex="-1"]), [href], [tabindex]:not([tabindex="-1"])'

/**
 * Fullscreen photo viewer. A real dialog: Escape closes it, arrows (or a swipe)
 * change photo, Tab stays inside it, and focus returns to wherever it came from.
 * Photos slide and cross-fade in the direction you are travelling.
 */
export function Lightbox() {
  const state = useLightbox()
  const event = events.find((e) => e.id === state.eventId)
  const photo = event?.photos[state.index]
  const dialog = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const drag = useRef<{ x: number } | null>(null)

  // focus management + scroll lock while open
  useEffect(() => {
    if (!state.open) return
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    dialog.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    return () => {
      document.documentElement.style.overflow = previousOverflow
      returnFocus.current?.focus?.()
    }
  }, [state.open])

  useEffect(() => {
    if (!state.open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') lightbox.close()
      else if (e.key === 'ArrowRight') lightbox.step(1)
      else if (e.key === 'ArrowLeft') lightbox.step(-1)
      else if (e.key === 'Tab') {
        const items = [...(dialog.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.open])

  // preload the neighbours so transitions never wait on the network
  useEffect(() => {
    if (!state.open || !event) return
    for (const delta of [-1, 1]) {
      const img = new Image()
      img.src = event.photos[(state.index + delta + event.photos.length) % event.photos.length].src
    }
  }, [state.open, state.index, event])

  const onPointerDown = (e: ReactPointerEvent) => {
    drag.current = { x: e.clientX }
  }
  const onPointerUp = (e: ReactPointerEvent) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    drag.current = null
    if (Math.abs(dx) > 60) lightbox.step(dx < 0 ? 1 : -1)
  }

  return (
    <AnimatePresence>
      {state.open && event && photo ? (
        <motion.div
          key="lightbox"
          ref={dialog}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${event.title}, photo ${state.index + 1} of ${event.photos.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button type="button" className="lightbox__scrim" aria-label="Close viewer" tabIndex={-1} onClick={lightbox.close} />

          <header className="lightbox__top">
            <div>
              <p className="lightbox__kind eyebrow">
                {event.kind}
                {event.location ? ` · ${event.location}` : ''}
                {event.date ? ` · ${event.date}` : ''}
              </p>
              <h2 className="lightbox__title">{event.title}</h2>
              {event.verified && event.role ? <p className="lightbox__role">{event.role}</p> : null}
            </div>
            <button type="button" className="pill" data-autofocus onClick={lightbox.close}>
              Close <span aria-hidden="true">✕</span>
            </button>
          </header>

          <div className="lightbox__stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
            <AnimatePresence initial={false} custom={state.direction} mode="popLayout">
              <motion.figure
                key={photo.src}
                className="lightbox__figure"
                custom={state.direction}
                variants={{
                  enter: (dir: number) => ({ opacity: 0, x: dir * 90, scale: 0.94, rotateY: dir * -14 }),
                  center: { opacity: 1, x: 0, scale: 1, rotateY: 0 },
                  exit: (dir: number) => ({ opacity: 0, x: dir * -90, scale: 0.94, rotateY: dir * 14 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <img src={photo.src} alt={photo.alt} draggable={false} />
                {photo.sample ? <span className="lightbox__badge">Sample photo</span> : null}
              </motion.figure>
            </AnimatePresence>
          </div>

          <footer className="lightbox__bottom">
            <p className="lightbox__caption">
              {photo.caption ?? event.description}
              {!event.verified ? <strong> · Sample event</strong> : null}
            </p>
            <div className="lightbox__controls">
              <button type="button" className="pill" onClick={() => lightbox.step(-1)} aria-label="Previous photo">
                <span aria-hidden="true">←</span>
              </button>
              <span className="lightbox__count" aria-live="polite">
                {state.index + 1} / {event.photos.length}
              </span>
              <button type="button" className="pill" onClick={() => lightbox.step(1)} aria-label="Next photo">
                <span aria-hidden="true">→</span>
              </button>
              {events.length > 1 ? (
                <button type="button" className="pill pill--solid" onClick={() => lightbox.stepEvent(1)}>
                  Next event <span aria-hidden="true">↠</span>
                </button>
              ) : null}
            </div>
            <ul className="lightbox__thumbs" aria-label="Photos in this event">
              {event.photos.map((p, i) => (
                <li key={p.src}>
                  <button
                    type="button"
                    aria-label={`Show photo ${i + 1}`}
                    aria-current={i === state.index ? 'true' : undefined}
                    onClick={() => lightbox.goTo(i)}
                  >
                    <img src={p.src} alt="" loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          </footer>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
