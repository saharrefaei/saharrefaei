import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { emailAddress, links, navItems, profile } from '../content/profile'
import './Header.css'

/** Highlights the nav pill of whichever section is crossing the middle of the viewport. */
function useActiveSection(): string {
  const [active, setActive] = useState('')
  useEffect(() => {
    let observer: IntersectionObserver | undefined
    let retry: number | undefined
    let tries = 0

    // In 3D mode the sections arrive with a lazily loaded chunk, so wait for them to exist.
    const attach = () => {
      const sections = navItems
        .map(({ id }) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
      if (sections.length < navItems.length && tries++ < 60) {
        retry = window.setTimeout(attach, 200)
        return
      }
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setActive(entry.target.id)
          }
        },
        { rootMargin: '-45% 0px -50% 0px' },
      )
      sections.forEach((section) => observer?.observe(section))
    }
    attach()

    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.4) setActive('')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(retry)
      observer?.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  return active
}

const FOCUSABLE = 'a[href], button:not([disabled])'
const PHONE_QUERY = '(max-width: 767px)'

/**
 * Phones: the five section pills do not fit, so the header is just the logo and a Menu button, and the
 * sections live in a full-screen menu (big, thumb-sized targets). From 768px up it is the pill bar.
 * `extra` is rendered at the foot of the menu (the 3D / simple view switch).
 */
function MobileMenu({ active, extra, onClose }: { active: string; extra: ReactNode; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    // everything behind the menu is out of reach of the keyboard and screen readers
    const behind = [document.getElementById('main'), document.querySelector<HTMLElement>('.site-nav')].filter(
      (el): el is HTMLElement => el !== null,
    )
    behind.forEach((el) => el.setAttribute('inert', ''))
    panel.current?.focus({ preventScroll: true })
    const media = window.matchMedia(PHONE_QUERY)
    const onChange = () => !media.matches && onClose()
    media.addEventListener('change', onChange)
    return () => {
      media.removeEventListener('change', onChange)
      behind.forEach((el) => el.removeAttribute('inert'))
      root.style.overflow = previousOverflow
    }
  }, [onClose])

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab') return
    const items = [...(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="menu" id="site-menu" role="dialog" aria-modal="true" aria-label="Site menu" tabIndex={-1} ref={panel} onKeyDown={onKeyDown}>
      <div className="menu__bar">
        <span className="site-nav__logo" aria-hidden="true">
          sr
        </span>
        <button type="button" className="menu__close pill" onClick={onClose}>
          Close <span aria-hidden="true">✕</span>
        </button>
      </div>

      <nav aria-label="Sections" className="menu__nav">
        <ul>
          {navItems.map((item, index) => (
            <li key={item.id} style={{ '--i': index } as React.CSSProperties}>
              <a href={`#${item.id}`} aria-current={active === item.id ? 'true' : undefined} onClick={onClose}>
                <span className="menu__num eyebrow" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="menu__label display">{item.label}</span>
                <span className="menu__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="menu__foot">
        <div className="menu__extra" onClick={onClose}>
          {extra}
        </div>
        <ul className="menu__links" aria-label="Elsewhere">
          <li>
            <a href={links.github} target="_blank" rel="noopener noreferrer">
              GitHub <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={links.email}>
              Email <span className="sr-only">: {emailAddress}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export function Header({ menuExtra }: { menuExtra?: ReactNode }) {
  const active = useActiveSection()
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  // stable identity, so MobileMenu's effect does not re-run (and re-focus) on every render
  const close = useCallback(() => {
    setOpen(false)
    // hand focus back to the button (a link press navigates, so this only matters when the menu is dismissed)
    requestAnimationFrame(() => button.current?.focus({ preventScroll: true }))
  }, [])

  return (
    <header className="site-header">
      <nav aria-label="Primary" className="site-nav">
        <a className="site-nav__logo" href="#top" aria-label={`sr — ${profile.name}, back to top`}>
          sr
        </a>
        <ul className="site-nav__list">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                className="site-nav__link"
                href={`#${item.id}`}
                aria-current={active === item.id ? 'true' : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="site-nav__menu"
          ref={button}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
        >
          Menu
          <span className="site-nav__menu-bars" aria-hidden="true" />
        </button>
      </nav>
      {open ? <MobileMenu active={active} extra={menuExtra} onClose={close} /> : null}
    </header>
  )
}
