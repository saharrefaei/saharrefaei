import { profile } from '../content/profile'
import './SiteFooter.css'

export function SiteFooter() {
  return (
    <footer className="on-ink site-footer-wrap">
      <div className="container site-footer">
        <p>
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </p>
        <p>Built with React, three.js and Motion.</p>
        <a href="#top" className="site-footer__top">
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  )
}
