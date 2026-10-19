import { MotionConfig } from 'framer-motion'
import { CursorFollower } from './components/CursorFollower'
import { Header } from './components/Header'
import { SiteFooter } from './components/SiteFooter'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Hero } from './sections/Hero'
import { Interests } from './sections/Interests'
import { Projects } from './sections/Projects'
import { SceneHost } from './scene/SceneHost'

export default function App() {
  return (
    // reducedMotion="user" drops transform animations for visitors who ask for less motion
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <SceneHost />
      <CursorFollower />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Interests />
        <Contact />
      </main>
      <SiteFooter />
    </MotionConfig>
  )
}
