import { useId } from 'react'
import type { ProjectVisualKind } from '../content/projects'
import './ProjectVisual.css'

/**
 * Generated artwork for each project. These are illustrations of what a project
 * is about — not screenshots — so nothing here pretends to be a real UI.
 */

type ArtProps = { uid: string; labels?: readonly string[] }

const POINTS = (count: number, radius: number, offset = 0) =>
  Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + offset
    return { x: 200 + Math.cos(angle) * radius, y: 200 + Math.sin(angle) * radius }
  })

function Network() {
  const rings = [
    { r: 62, n: 4, o: 0.3 },
    { r: 104, n: 6, o: 0 },
    { r: 144, n: 8, o: 0.2 },
    { r: 182, n: 10, o: 0.1 },
  ]
  return (
    <g>
      {rings.map((ring) => (
        <circle key={ring.r} cx="200" cy="200" r={ring.r} className="pv-line" />
      ))}
      {rings.flatMap((ring) =>
        POINTS(ring.n, ring.r, ring.o).map((p, i) => (
          <g key={`${ring.r}-${i}`}>
            <line x1="200" y1="200" x2={p.x} y2={p.y} className="pv-link" style={{ animationDelay: `${(i * 0.37 + ring.r * 0.01) % 3}s` }} />
            <circle cx={p.x} cy={p.y} r={ring.r > 150 ? 6 : 8} className="pv-node" />
          </g>
        )),
      )}
      <circle cx="200" cy="200" r="22" className="pv-core" />
    </g>
  )
}

function Orb({ uid }: ArtProps) {
  return (
    <g className="pv-float">
      <circle cx="200" cy="205" r="120" fill={`url(#${uid}-orb)`} />
      <ellipse cx="160" cy="150" rx="46" ry="30" fill="#fff" opacity="0.5" transform="rotate(-28 160 150)" />
      <circle cx="200" cy="205" r="160" className="pv-line" />
      <circle cx="318" cy="105" r="12" className="pv-node" />
      <circle cx="84" cy="290" r="8" className="pv-node" />
    </g>
  )
}

function Pipeline({ labels = ['train', 'tune', 'serve'] }: { labels?: readonly string[] }) {
  const nodes = [
    { x: 40, label: labels[0] },
    { x: 150, label: labels[1] },
    { x: 260, label: labels[2] },
  ]
  return (
    <g>
      {nodes.map((node, i) => (
        <g key={node.label}>
          {i < nodes.length - 1 ? <line x1={node.x + 100} y1="200" x2={nodes[i + 1].x} y2="200" className="pv-flow" /> : null}
          <rect x={node.x} y="160" width="100" height="80" rx="10" className={i === 1 ? 'pv-box pv-box--hot' : 'pv-box'} />
          <text x={node.x + 50} y="206" textAnchor="middle" className="pv-label">
            {node.label}
          </text>
        </g>
      ))}
      <path d="M90 160 V110 H310 V160" className="pv-flow" fill="none" />
    </g>
  )
}

function Bars({ uid }: ArtProps) {
  const count = 22
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const height = 60 + Math.abs(Math.sin(i * 1.7)) * 190
        return (
          <rect
            key={i}
            x={26 + i * 16.5}
            y={200 - height / 2}
            width="9"
            height={height}
            rx="4.5"
            className="pv-bar"
            style={{ animationDelay: `${i * 0.09}s`, transformOrigin: `${30.5 + i * 16.5}px 200px` }}
            fill={`url(#${uid}-bar)`}
          />
        )
      })}
    </g>
  )
}

function Layers() {
  const plate = (y: number, className: string) => (
    <path key={y} d={`M200 ${y} L340 ${y + 70} L200 ${y + 140} L60 ${y + 70} Z`} className={className} />
  )
  return (
    <g>
      {plate(210, 'pv-plate')}
      {plate(160, 'pv-plate')}
      <g className="pv-float">{plate(105, 'pv-plate pv-plate--hot')}</g>
    </g>
  )
}

const ARTWORK: Record<ProjectVisualKind, (props: ArtProps) => React.ReactElement> = {
  network: Network,
  orb: Orb,
  pipeline: Pipeline,
  bars: Bars,
  layers: Layers,
}

export function ProjectVisual({ kind, labels }: { kind: ProjectVisualKind; labels?: readonly string[] }) {
  const Art = ARTWORK[kind]
  // Unique per instance: url(#id) breaks if the first same-named SVG is display:none.
  const uid = `pv${useId().replace(/:/g, '')}`
  return (
    <svg className="pv" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={`${uid}-dots`} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.3" fill="#fffaf6" opacity="0.18" />
        </pattern>
        <radialGradient id={`${uid}-orb`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#ffb08a" />
          <stop offset="0.45" stopColor="#ff3d8b" />
          <stop offset="1" stopColor="#c21fd8" />
        </radialGradient>
        <linearGradient id={`${uid}-bar`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff5a1f" />
          <stop offset="1" stopColor="#c21fd8" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" className="pv-bg" />
      <rect width="400" height="400" fill={`url(#${uid}-dots)`} />
      <Art uid={uid} labels={labels} />
    </svg>
  )
}
