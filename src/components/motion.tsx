import { useRef, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import './motion.css'

const EASE = [0.16, 1, 0.3, 1] as const

/** Fades and lifts a block into place once, as it enters the viewport. */
export function FadeUp({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'p' | 'li' | 'article'
}) {
  const reduced = useReducedMotion()
  const Component = motion[as]
  return (
    <Component
      className={className}
      initial={reduced ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Component>
  )
}

/** Oversized heading whose lines slide up out of a mask when scrolled into view. */
export function MaskHeading({
  lines,
  as: Tag = 'h2',
  className,
  id,
}: {
  lines: string[]
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  id?: string
}) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLHeadingElement>(null)
  // Observe the heading, not the lines: a line translated out of its overflow mask counts as not visible.
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  return (
    <Tag className={className} id={id} ref={ref}>
      {lines.map((line, index) => (
        <span className="mask-line" key={line}>
          <motion.span
            className="mask-line__inner"
            initial={reduced ? false : { y: '112%' }}
            animate={{ y: reduced || inView ? '0%' : '112%' }}
            transition={{ duration: 1.05, ease: EASE, delay: index * 0.09 }}
          >
            {line}
          </motion.span>
          {index < lines.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  )
}

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <>
      <motion.span style={{ opacity }}>{word}</motion.span>{' '}
    </>
  )
}

/** A paragraph that lights up word by word as you scroll through it. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.88', 'end 0.5'] })
  const words = text.split(' ')

  if (reduced) return <p className={className}>{text}</p>

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => (
        <Word key={`${word}-${index}`} word={word} progress={scrollYProgress} range={[index / words.length, (index + 1) / words.length]} />
      ))}
    </p>
  )
}

/** Giant outlined type that drifts sideways as the page scrolls past it. */
export function ScrollBand({ rows }: { rows: { text: string; direction: 1 | -1 }[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const forward = useTransform(scrollYProgress, [0, 1], ['6%', '-34%'])
  const backward = useTransform(scrollYProgress, [0, 1], ['-34%', '6%'])

  return (
    <div className="scroll-band" ref={ref} aria-hidden="true">
      {rows.map((row, index) => (
        <motion.div
          key={row.text}
          data-text={`${row.text} · ${row.text} · ${row.text}`}
          className={`scroll-band__row${index % 2 ? ' scroll-band__row--solid' : ''}`}
          style={{ x: reduced ? 0 : row.direction === 1 ? forward : backward }}
        >
          {/* text lives in a pseudo-element: it is decorative, so it should not be page content */}
        </motion.div>
      ))}
    </div>
  )
}
