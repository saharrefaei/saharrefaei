import { SectionHead } from '../components/SectionHead'
import { FadeUp } from '../components/motion'
import { events } from '../content/events'
import { lightbox } from '../world/lightboxStore'
import './Events.css'

/** Flat-mode gallery: the 3D journey's accessible twin. Same data, same fullscreen viewer. */
export function Events() {
  return (
    <section id="events" className="section on-ink events" data-scene-section aria-labelledby="events-title">
      <div className="container">
        <SectionHead index="04" label="Events & community" titleId="events-title" titleLines={['Events &', 'community']} tone="ink" />

        <div className="events__list">
          {events.map((event) => {
            const allSample = event.photos.every((p) => p.sample)
            return (
              <FadeUp key={event.id} className="event" as="article">
                <div className="event__info">
                  <p className="eyebrow event__meta">
                    {event.kind}
                    {event.location ? ` · ${event.location}` : ''}
                    {event.date ? ` · ${event.date}` : ''}
                  </p>
                  <h3 className="display event__title">{event.title}</h3>
                  <p className="event__badges">
                    <span className={`badge ${event.verified ? 'badge--real' : 'badge--sample'}`}>
                      {event.verified ? 'Real event' : 'Sample event'}
                    </span>
                    {allSample ? <span className="badge badge--sample">Sample photos</span> : null}
                  </p>
                  {event.verified && event.role ? (
                    <p className="event__role">
                      <span>My role: </span>
                      <strong>{event.role}</strong>
                    </p>
                  ) : null}
                  <p className="event__description">{event.description}</p>
                  <button type="button" className="pill pill--solid" onClick={() => lightbox.open(event.id, 0)}>
                    View photos <span aria-hidden="true">↗</span>
                  </button>
                </div>

                <ul className="event__photos" aria-label={`Photos from ${event.title}`}>
                  {event.photos.map((photo, i) => (
                    <li key={photo.src} style={{ '--tilt': `${[-3, 2.5, -1.5, 3][i % 4]}deg` } as React.CSSProperties}>
                      <button type="button" aria-label={`Open photo ${i + 1} of ${event.photos.length}: ${event.title}`} onClick={() => lightbox.open(event.id, i)}>
                        <img src={photo.src} alt={photo.alt} loading="lazy" />
                        {photo.sample ? <span className="event__sample">Sample photo</span> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </FadeUp>
            )
          })}
        </div>
      </div>
    </section>
  )
}
