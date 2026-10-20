import { DotText } from './DotText'
import { MaskHeading } from './motion'
import './SectionHead.css'

type Tone = 'paper' | 'ink' | 'heat'

const DOT_COLORS: Record<Tone, { color: string; offColor: string }> = {
  paper: { color: '#14080f', offColor: 'rgba(20, 8, 15, 0.16)' },
  heat: { color: '#14080f', offColor: 'rgba(20, 8, 15, 0.22)' },
  ink: { color: '#ff5a1f', offColor: 'rgba(255, 250, 246, 0.16)' },
}

type Props = {
  /** Two-digit section number, drawn in dot-matrix. */
  index: string
  label: string
  titleLines: string[]
  titleId: string
  tone: Tone
}

export function SectionHead({ index, label, titleLines, titleId, tone }: Props) {
  const dots = DOT_COLORS[tone]
  return (
    <div className="section-head">
      <div className="section-head__meta">
        <DotText text={index} label="" pitch={4} {...dots} hoverColor="#ff3d8b" />
        <span className="eyebrow">{label}</span>
      </div>
      <MaskHeading id={titleId} className="section-title display" lines={titleLines} />
    </div>
  )
}
