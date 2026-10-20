import { useCallback, useEffect, useRef } from 'react'
import { useFrame, useStore } from '@react-three/fiber'
import { useDetail } from './detailStore'

/** Frames drawn (after the scene reports ready) before the loop stops, so a deep link shows a finished picture. */
const SETTLE_FRAMES = 3
/** Give up waiting for the scene's "ready" signal after this many frames (e.g. a scene that never sets it). */
const MAX_WAIT_FRAMES = 120

/**
 * Drop inside a <Canvas>: stops its render loop while a detail view covers the page, and resumes it
 * (in whatever mode it was in) when the view closes. The last frame stays on screen, so the scene is
 * frozen exactly where it was; with the loop stopped the background costs no GPU or CPU time.
 *
 *  - The pause waits until the scene has drawn a few frames, so opening a deep link does not freeze a
 *    world that has never been drawn (panels are positioned in the frame loop).
 *  - R3F's <Canvas> re-applies its own `frameloop` prop whenever it re-renders (a resize, a rotation,
 *    a media-query change), so the pause is re-asserted for as long as the view is open.
 *  - R3F zeroes the clock when the loop mode changes; it is put back, so animations continue from
 *    where they were instead of snapping to t = 0 as the view closes.
 *
 * It is a separate component so toggling it re-renders nothing else in the scene.
 */
export function FramePause() {
  const open = useDetail().ref !== null
  const store = useStore()
  const frames = useRef(0)
  const paused = useRef<{ restore: () => void } | null>(null)

  const pause = useCallback(() => {
    const state = store.getState()
    const previous = state.frameloop
    const elapsed = state.clock.elapsedTime
    state.setFrameloop('never')
    const unsubscribe = store.subscribe((next) => {
      if (next.frameloop !== 'never') next.setFrameloop('never')
    })
    paused.current = {
      restore: () => {
        unsubscribe()
        const now = store.getState()
        now.setFrameloop(previous)
        now.clock.elapsedTime = elapsed
      },
    }
  }, [store])

  useFrame(() => {
    if (!open || paused.current) return
    frames.current++
    const ready = document.documentElement.dataset.scene === 'ready' && frames.current >= SETTLE_FRAMES
    if (ready || frames.current >= MAX_WAIT_FRAMES) pause()
  })

  useEffect(() => {
    if (!open) return
    frames.current = 0
    return () => {
      paused.current?.restore()
      paused.current = null
    }
  }, [open])

  return null
}
