import './ViewToggle.css'

type Props = {
  mode: 'world' | 'flat'
  onToggle: () => void
  /** 'floating' is the pill in the corner (hidden on phones); 'menu' is the copy inside the phone menu. */
  variant?: 'floating' | 'menu'
}

/**
 * Lets anyone switch between the immersive 3D journey and the simple, ordinary
 * scrolling page. It is the second tab stop (right after "Skip to content"), so
 * assistive-technology users meet it immediately.
 */
export function ViewToggle({ mode, onToggle, variant = 'floating' }: Props) {
  return (
    <button type="button" className={`view-toggle view-toggle--${variant}`} onClick={onToggle}>
      {mode === 'world' ? 'Simple version' : '3D journey'}
      <span className="sr-only">{mode === 'world' ? ': switch to the standard scrolling page' : ': switch to the immersive 3D experience'}</span>
    </button>
  )
}
