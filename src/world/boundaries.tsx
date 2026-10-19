import { Component, type ReactNode } from 'react'

/**
 * Catches anything thrown below it (a bad photo URL, a failed font or chunk fetch, a renderer that
 * cannot start) so one failure degrades gracefully instead of blanking the page.
 */
export class Boundary extends Component<{ children: ReactNode; onError?: (error: Error) => void; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}
