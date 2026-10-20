import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useMediaQuery, usePrefersReducedMotion } from '../lib/capabilities'
import './CursorFollower.css'

const INTERACTIVE = 'a, button, [data-cursor]'

function Follower() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, { stiffness: 520, damping: 42, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 520, damping: 42, mass: 0.4 })
  const [active, setActive] = useState(false)

  useEffect(() => {
    const move = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
    }
    const over = (event: PointerEvent) => {
      setActive(event.target instanceof Element && event.target.closest(INTERACTIVE) !== null)
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
    }
  }, [x, y])

  return (
    <motion.div
      className="cursor-follower"
      aria-hidden="true"
      style={{ x: springX, y: springY }}
      animate={{ scale: active ? 2.4 : 1, backgroundColor: active ? '#ffffff' : 'rgba(255,255,255,0)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    />
  )
}

/** A trailing ring for mouse users. The native cursor is never hidden. */
export function CursorFollower() {
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reducedMotion = usePrefersReducedMotion()
  if (!finePointer || reducedMotion) return null
  return <Follower />
}
