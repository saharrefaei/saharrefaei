import { useSyncExternalStore } from 'react'
import { events } from '../content/events'

/**
 * Tiny external store for the fullscreen photo viewer. It lives outside React
 * state because it is opened from inside the WebGL canvas (a separate React
 * root) and from ordinary DOM buttons alike.
 */
type State = { open: boolean; eventId: string; index: number; direction: 1 | -1 }

let state: State = { open: false, eventId: '', index: 0, direction: 1 }
const listeners = new Set<() => void>()
const emit = (next: State) => {
  state = next
  listeners.forEach((fn) => fn())
}

const wrap = (n: number, size: number) => (n + size) % size

export const lightbox = {
  get: () => state,
  subscribe: (fn: () => void) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  open(eventId: string, index = 0) {
    if (events.some((e) => e.id === eventId)) emit({ open: true, eventId, index, direction: 1 })
  },
  close() {
    emit({ ...state, open: false })
  },
  /** Previous / next photo of the current event. */
  step(delta: 1 | -1) {
    const event = events.find((e) => e.id === state.eventId)
    if (!event) return
    emit({ ...state, index: wrap(state.index + delta, event.photos.length), direction: delta })
  },
  /** Jump to the first photo of the previous / next event. */
  stepEvent(delta: 1 | -1) {
    const at = events.findIndex((e) => e.id === state.eventId)
    if (at < 0) return
    emit({ open: true, eventId: events[wrap(at + delta, events.length)].id, index: 0, direction: delta })
  },
  goTo(index: number) {
    emit({ ...state, index, direction: index >= state.index ? 1 : -1 })
  },
}

export const useLightbox = () => useSyncExternalStore(lightbox.subscribe, lightbox.get, lightbox.get)
