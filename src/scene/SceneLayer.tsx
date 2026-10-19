import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { startSceneInput } from '../lib/sceneInput'
import { useCoarsePointer, useNarrowViewport, usePrefersReducedMotion } from '../lib/capabilities'
import { Composition } from './Composition'
import './SceneLayer.css'

/**
 * Fixed, full-viewport WebGL layer that sits above section backgrounds but
 * below page content. Loaded lazily (see App.tsx) so the HTML content is
 * interactive long before three.js has been downloaded.
 */
export default function SceneLayer() {
  const narrow = useNarrowViewport()
  const coarse = useCoarsePointer()
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    return startSceneInput()
  }, [reducedMotion])

  return (
    <div className="scene-layer" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 9], fov: 32 }}
        frameloop={reducedMotion ? 'demand' : 'always'}
        gl={{ antialias: !coarse, alpha: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: true }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
            // Fall back to the CSS visuals if the GPU context is lost.
            delete document.documentElement.dataset.scene
          })
          // three.js restores the context itself; show the scene again once it has.
          gl.domElement.addEventListener('webglcontextrestored', () => {
            document.documentElement.dataset.scene = 'ready'
          })
        }}
      >
        <Composition lowPower={coarse || narrow} narrow={narrow} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}
