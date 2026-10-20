import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { DotTicker } from '../components/DotTicker'
import { links, profile } from '../content/profile'
import { usePrefersReducedMotion } from '../lib/capabilities'
import './Hero.css'

const NAME_LINES = ['SAHAR', 'REFAEI']

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: profile.timeZone,
})

function useBerlinTime(): string {
  const [time, setTime] = useState(() => timeFormat.format(new Date()))
  useEffect(() => {
    const id = window.setInterval(() => setTime(timeFormat.format(new Date())), 15_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

/** Letters lean toward and warm up near the pointer; only transforms and colour change, so nothing reflows. Rects come from the untransformed wrapper so the effect cannot feed back on itself. */
function useLetterProximity(reducedMotion: boolean) {
  const nameRef = useRef<HTMLHeadingElement>(null)
  const frame = useRef(0)

  const reset = () => {
    cancelAnimationFrame(frame.current)
    nameRef.current?.querySelectorAll<HTMLElement>('[data-letter]').forEach((el) => el.style.setProperty('--p', '0'))
  }

  const onMove = (event: PointerEvent<HTMLHeadingElement>) => {
    if (reducedMotion || event.pointerType === 'touch') return
    const { clientX, clientY } = event
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const letters = [...(nameRef.current?.querySelectorAll<HTMLElement>('[data-letter]') ?? [])]
      // read every rect first, then write, so styles are not invalidated between reads
      const rects = letters.map((el) => el.parentElement!.getBoundingClientRect())
      letters.forEach((el, i) => {
        const rect = rects[i]
        const distance = Math.hypot(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2))
        el.style.setProperty('--p', Math.max(0, 1 - distance / (rect.height * 0.75)).toFixed(3))
      })
    })
  }

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return { nameRef, onMove, onLeave: reset }
}

export function Hero() {
  const time = useBerlinTime()
  const reducedMotion = usePrefersReducedMotion()
  const { nameRef, onMove, onLeave } = useLetterProximity(reducedMotion)
  let letterIndex = 0

  return (
    <section id="top" className="hero dot-grid" data-scene-section aria-labelledby="hero-name">
      {/* CSS stand-ins for the 3D scene: visible without WebGL, while it loads, and if it fails. */}
      <div className="hero__fallback" aria-hidden="true">
        <span className="hero__orb hero__orb--a" />
        <span className="hero__orb hero__orb--b" />
        <span className="hero__orb hero__orb--c" />
        <span className="hero__orb hero__orb--d" />
      </div>

      <div className="container hero__inner">
        <div className="hero__meta eyebrow">
          <span>Portfolio 2026</span>
          <span>
            {profile.location} · <time>{time}</time>
          </span>
        </div>

        <h1
          id="hero-name"
          ref={nameRef}
          className="hero__name display"
          aria-label={profile.name}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          {NAME_LINES.map((line) => (
            <span className="hero__line" key={line} aria-hidden="true">
              {[...line].map((char) => {
                const i = letterIndex++
                return (
                  <span className="hero__letter-clip" key={i}>
                    <span className="hero__letter-rise" style={{ animationDelay: `${0.15 + i * 0.06}s` }}>
                      <span className="hero__letter" data-letter>
                        {char}
                      </span>
                    </span>
                  </span>
                )
              })}
            </span>
          ))}
        </h1>

        <div className="hero__lower">
          <div className="hero__copy">
            <p className="hero__role">
              {profile.role} <span aria-hidden="true">·</span> {profile.focus}
            </p>
            <p className="hero__intro">{profile.tagline}</p>
          </div>

          <ul className="hero__links" aria-label="Quick links">
            <li>
              <a className="pill pill--solid" href="#projects">
                Projects <span className="arrow" aria-hidden="true">↓</span>
              </a>
            </li>
            <li>
              <a className="pill" href={links.github} target="_blank" rel="noopener noreferrer">
                GitHub <span className="arrow" aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a className="pill" href={links.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn <span className="arrow" aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a className="pill" href="#contact">
                Contact <span className="arrow" aria-hidden="true">↓</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="hero__ticker">
        <DotTicker text="SOFTWARE ENGINEER · FRONTEND & APPLIED AI · BERLIN" pitch={7} color="#14080f" offColor="rgba(20, 8, 15, 0.22)" />
      </div>
    </section>
  )
}
