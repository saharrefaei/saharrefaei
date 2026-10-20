import { useEffect, useState } from 'react'
import { navItems, profile } from '../content/profile'
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

export function Header() {
  const active = useActiveSection()
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
      </nav>
    </header>
  )
}
