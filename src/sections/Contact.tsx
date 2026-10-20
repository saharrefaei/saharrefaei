import { DotText } from '../components/DotText'
import { FadeUp, MaskHeading } from '../components/motion'
import { emailAddress, links } from '../content/profile'
import './Contact.css'

const CONTACT_LINKS = [
  { label: 'Email', value: emailAddress, href: links.email, external: false },
  { label: 'GitHub', value: 'github.com/saharrefaei', href: links.github, external: true },
  { label: 'LinkedIn', value: 'linkedin.com/in/sahar-refaei', href: links.linkedin, external: true },
] as const

export function Contact() {
  return (
    <section id="contact" className="section on-ink contact" data-scene-section aria-labelledby="contact-title">
      <div className="container">
        <p className="eyebrow contact__eyebrow">05 — Contact</p>

        <div className="contact__dots">
          <DotText
            text="HELLO"
            label=""
            color="#ff5a1f"
            hoverColor="#ffffff"
            offColor="rgba(255, 250, 246, 0.13)"
          />
        </div>

        <MaskHeading id="contact-title" className="contact__title display" lines={['Let’s build something', 'thoughtful.']} />

        <FadeUp>
          <p className="contact__lede">
            Frontend engineering, applied AI, or an idea worth prototyping — I’d love to hear what you’re working on.
          </p>
        </FadeUp>

        <ul className="contact__links">
          {CONTACT_LINKS.map((link) => (
            <li key={link.label}>
              <a
                className="contact-link"
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="contact-link__label eyebrow">{link.label}</span>
                <span className="contact-link__value display">{link.value}</span>
                <span className="contact-link__arrow" aria-hidden="true">
                  {link.external ? '↗' : '→'}
                </span>
                {link.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
              </a>
            </li>
          ))}
        </ul>

      </div>
    </section>
  )
}
