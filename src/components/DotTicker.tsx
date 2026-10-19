import { DotText } from './DotText'
import './DotTicker.css'

type Props = {
  text: string
  pitch?: number
  color?: string
  offColor?: string
  /** Seconds for one full loop. */
  duration?: number
}

/**
 * Endless dot-matrix ticker. Two identical copies slide by exactly one copy
 * width, so the loop is seamless. Decorative: the same information is always
 * present as real text elsewhere on the page.
 */
export function DotTicker({ text, pitch = 8, color, offColor, duration = 70 }: Props) {
  const copy = `${text}   ·   `
  return (
    <div className="dot-ticker" aria-hidden="true">
      <div className="dot-ticker__track" style={{ animationDuration: `${duration}s` }}>
        <DotText className="dot-ticker__copy" text={copy} label="" pitch={pitch} color={color} offColor={offColor} interactive={false} reveal={false} />
        <DotText className="dot-ticker__copy" text={copy} label="" pitch={pitch} color={color} offColor={offColor} interactive={false} reveal={false} />
      </div>
    </div>
  )
}
