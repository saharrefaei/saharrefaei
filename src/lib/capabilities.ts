import { useSyncExternalStore } from 'react'

/** True when a WebGL context can actually be created on this device. */
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    // failIfMajorPerformanceCaveat rejects software renderers (SwiftShader/llvmpipe), which would crawl
    const options = { failIfMajorPerformanceCaveat: true }
    const gl = (canvas.getContext('webgl2', options) ?? canvas.getContext('webgl', options)) as WebGLRenderingContext | null
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

/** Very low-end devices keep the lightweight CSS visuals instead of WebGL. */
export function isLowEndDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 1
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', notify)
      return () => mq.removeEventListener('change', notify)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const useCoarsePointer = () => useMediaQuery('(pointer: coarse)')
/** Phones and portrait tablets: compact 3D poses and a lighter render. */
export const useNarrowViewport = () => useMediaQuery('(max-width: 1023px)')
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
