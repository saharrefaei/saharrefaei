/** The overlay is its own chunk. Shared so hover/focus/idle can fetch it ahead of the first click. */
export const loadOverlay = () => import('./DetailOverlay')

export const prefetchDetail = () => {
  // a failed prefetch is retried by the real load on click; it must not surface as an unhandled rejection
  loadOverlay().catch(() => undefined)
}
