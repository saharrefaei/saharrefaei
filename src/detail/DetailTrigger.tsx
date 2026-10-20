import { detail } from './detailStore'
import './trigger.css'
import { prefetchDetail } from './loadOverlay'
import { detailPath, type DetailRef } from './routes'

/**
 * The "View details" control. A real link to the item's own URL (so it can be copied, opened in a
 * new tab, and read by assistive tech as navigation), whose click opens the in-page view instead.
 * Its ::after stretches over the nearest positioned ancestor, so the whole card is clickable
 * while this stays the one tab stop. Used by both the 3D panels and the flat page.
 */
export function DetailTrigger({ to, label, className = '' }: { to: DetailRef; label: string; className?: string }) {
  return (
    <a
      className={`dtrigger ${className}`}
      href={detailPath(to)}
      onPointerEnter={prefetchDetail}
      onFocus={prefetchDetail}
      onClick={(event) => {
        // modified clicks keep their normal meaning (open in new tab, etc.)
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
        event.preventDefault()
        detail.open(to, event)
      }}
    >
      <span className="dtrigger__label">View details</span>
      <span className="dtrigger__arrow" aria-hidden="true">
        →
      </span>
      <span className="sr-only"> for {label}</span>
    </a>
  )
}
