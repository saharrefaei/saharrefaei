import { useState } from 'react'
import { DotText } from '../components/DotText'
import { SectionHead } from '../components/SectionHead'
import { interests, type InterestGroup } from '../content/interests'
import './Interests.css'

const GROUP_COLOR: Record<InterestGroup, string> = {
  Craft: 'var(--orange)',
  Intelligence: 'var(--pink)',
  Tooling: 'var(--magenta)',
}

const GROUPS = Object.keys(GROUP_COLOR) as InterestGroup[]

/**
 * Interests as an oversized typographic index. Hovering, focusing or tapping a
 * line lights it up and sends its code to the dot-matrix readout.
 */
export function Interests() {
  const [activeId, setActiveId] = useState(interests[0].id)
  const active = interests.find((item) => item.id === activeId) ?? interests[0]

  return (
    <section id="interests" className="section on-paper interests" data-scene-section aria-labelledby="interests-title">
      <div className="container">
        <SectionHead
          index="04"
          label="Engineering & AI interests"
          titleId="interests-title"
          titleLines={['What pulls', 'my attention']}
          tone="paper"
        />

        <ul className="interests__legend" aria-label="Groups">
          {GROUPS.map((group) => (
            <li key={group} style={{ '--group': GROUP_COLOR[group] } as React.CSSProperties}>
              <span className="interests__swatch" aria-hidden="true" />
              {group}
            </li>
          ))}
        </ul>

        <div className="interests__layout">
          <ul className="interests__list">
            {interests.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="interest"
                  data-active={item.id === active.id ? 'true' : undefined}
                  style={{ '--group': GROUP_COLOR[item.group] } as React.CSSProperties}
                  onPointerEnter={() => setActiveId(item.id)}
                  onFocus={() => setActiveId(item.id)}
                  onClick={() => setActiveId(item.id)}
                >
                  <span className="interest__title display">{item.title}</span>
                  <span className="interest__group eyebrow">{item.group}</span>
                  <span className="sr-only">
                    . {item.group}: {item.note}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="interests__readout">
            {/* purely visual echo of the hovered line; each button already carries its note for assistive tech */}
            <div className="readout" aria-hidden="true">
              <p className="readout__group eyebrow" style={{ '--group': GROUP_COLOR[active.group] } as React.CSSProperties}>
                <span className="interests__swatch" aria-hidden="true" />
                {active.group}
              </p>
              <DotText
                text={active.code}
                label=""
                maxPitch={9}
                className="readout__dots"
                color="#ff5a1f"
                hoverColor="#c21fd8"
                offColor="rgba(255, 250, 246, 0.14)"
                reveal={false}
              />
              <p className="readout__note">{active.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
