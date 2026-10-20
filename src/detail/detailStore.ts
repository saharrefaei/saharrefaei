import { useSyncExternalStore } from 'react'
import { detailExists, detailPath, parseDetailPath, type DetailRef } from './routes'

/**
 * State of the project / experience detail view. Like the photo viewer's store, it lives outside
 * React because it is opened from DOM panels that sit inside the WebGL scene (separate React roots)
 * and from ordinary page buttons alike.
 *
 * The URL is the source of truth: opening pushes /projects/<id> (or /experience/<id>), closing goes
 * back, and the browser's Back / Forward simply re-read the path. Each pushed entry remembers the
 * scroll position it was opened from, so the 3D camera (which is driven by scroll) can be put back
 * exactly, even after a reload.
 */
export type DetailOrigin = { x: number; y: number }
type State = { ref: DetailRef | null; origin: DetailOrigin | null }

/** What history.state holds on entries this module created. */
type EntryState = {
  detail: true
  /** Scroll position the visitor opened the view from. */
  y: number | null
  /** True when this module pushed the entry, so Back leads to the page the visitor came from. */
  pushed: boolean
}
const entryState = (): EntryState | null => {
  const s = history.state as Partial<EntryState> | null
  return s && s.detail === true ? (s as EntryState) : null
}

const initial = parseDetailPath(window.location.pathname)
let state: State = { ref: initial, origin: null }
const listeners = new Set<() => void>()
const emit = (next: State) => {
  // Closing something nobody opened from a control here (a deep link, or Forward/Back): hand focus to
  // the item's own "View details" link if it is on screen, instead of dropping it on <body>.
  if (state.ref && !next.ref && !returnFocus) {
    const link = document.querySelector<HTMLElement>(`a.dtrigger[href="${detailPath(state.ref)}"]`)
    if (link && link.getClientRects().length > 0) returnFocus = link
  }
  state = next
  listeners.forEach((fn) => fn())
}

/** Where to restore focus on close (the control that opened the view). */
let returnFocus: HTMLElement | null = null
/** Scroll position the page had when the view opened (null for a deep link); put back on close. */
let scrollAtOpen: number | null = entryState()?.y ?? null
/** True between `history.back()` and the popstate it causes, so a second close (key repeat, double click) cannot go back twice. */
let closing = false

/** Taken once at startup by whichever mode renders first, to scroll the background to the right stop. */
let pendingInitial: { ref: DetailRef; y: number | null } | null = initial ? { ref: initial, y: entryState()?.y ?? null } : null

const originOf = (event: { clientX: number; clientY: number }, element: Element | null): DetailOrigin => {
  // keyboard activation reports 0,0: fall back to the centre of the control
  if ((event.clientX || event.clientY) && Number.isFinite(event.clientX)) return { x: event.clientX, y: event.clientY }
  const rect = element?.getBoundingClientRect()
  return rect
    ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
}

export const detail = {
  get: () => state,
  subscribe: (fn: () => void) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },

  /** Open from a click or key press on `trigger`. Opening while a view is open swaps it (see `swap`). */
  open(ref: DetailRef, event?: { clientX: number; clientY: number; currentTarget: EventTarget | null }) {
    if (!detailExists(ref)) return
    const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
    if (state.ref) return detail.swap(ref)
    returnFocus = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    scrollAtOpen = window.scrollY
    history.pushState({ detail: true, y: scrollAtOpen, pushed: true } satisfies EntryState, '', detailPath(ref))
    emit({ ref, origin: event ? originOf(event, trigger) : null })
  },

  /** Show another item without adding a history entry, so one Back still closes the view. */
  swap(ref: DetailRef) {
    if (!detailExists(ref)) return
    history.replaceState({ detail: true, y: scrollAtOpen, pushed: entryState()?.pushed ?? false } satisfies EntryState, '', detailPath(ref))
    emit({ ref, origin: state.origin })
  },

  close() {
    if (!state.ref || closing) return
    // an entry we pushed: Back returns to exactly where the visitor was (hash included)
    if (entryState()?.pushed) {
      closing = true
      history.back()
    }
    // a deep link: there is nothing of ours to go back to, so just drop the path
    else {
      history.replaceState(null, '', '/')
      emit({ ref: null, origin: null })
    }
  },

  /** Where the page was scrolled when the view opened (null: deep link), and the control to hand focus back to. */
  restoration: () => ({ scrollY: scrollAtOpen, focusTarget: returnFocus }),
  clearFocusTarget() {
    returnFocus = null
  },

  /** One-shot: the deep-linked item and the scroll position saved with its history entry, if any. */
  takeInitial() {
    const taken = pendingInitial
    pendingInitial = null
    return taken
  },
}

window.addEventListener('popstate', () => {
  closing = false
  const ref = parseDetailPath(window.location.pathname)
  const saved = entryState()
  if (saved) scrollAtOpen = saved.y
  emit({ ref, origin: null })
})

export const useDetail = () => useSyncExternalStore(detail.subscribe, detail.get, detail.get)
