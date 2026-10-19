import './ViewToggle.css'

type Props = {
  mode: 'world' | 'flat'
  onToggle: () => void
}

/**
 * Lets anyone switch between the immersive 3D journey and the simple, ordinary
 * scrolling page. It is the second tab stop (right after "Skip to content"), so
 * assistive-technology users meet it immediately.
 */
export function ViewToggle({ mode, onToggle }: Props) {
  return (
    <button type="button" className="view-toggle" onClick={onToggle}>
      {mode === 'world' ? 'Simple version' : '3D journey'}
      <span className="sr-only">{mode === 'world' ? ': switch to the standard scrolling page' : ': switch to the immersive 3D experience'}</span>
    </button>
  )
}
