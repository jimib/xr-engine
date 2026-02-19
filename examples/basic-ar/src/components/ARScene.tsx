/**
 * ARScene -- Everything inside the Canvas for the AR experience.
 *
 * The required component hierarchy is:
 *   <XRProvider>              -- Creates the XR context (event bus, session manager, etc.)
 *     <XRRenderBridge />      -- Takes over R3F's render loop to interleave XR processing
 *     <XRCameraBackground />  -- Fullscreen mesh showing the device camera feed
 *     <YourContent />         -- Your 3D scene content
 *   </XRProvider>
 *
 * IMPORTANT: Hooks like useXREngine and useXRSession must be called
 * inside <XRProvider>, so scene content that uses them must be a
 * child component (ARContent below), not inline in ARScene.
 */

import { useEffect } from 'react'
import {
  XRProvider,
  XRRenderBridge,
  XRCameraBackground,
  useXREngine,
  useXRSession,
} from '@xr-engine/r3f-bridge'
import { RotatingBox } from './RotatingBox'

// Read engine URLs from environment variables (see .env.example)
const ENGINE_URL = import.meta.env.VITE_XR8_ENGINE_URL as string
const EXTRAS_URL = import.meta.env.VITE_XR8_EXTRAS_URL as string

const engineConfig = {
  engineUrl: ENGINE_URL || undefined,
  extrasUrl: EXTRAS_URL || undefined,
}

export function ARScene() {
  return (
    <XRProvider engineConfig={engineConfig} autoLoad>
      {/* XRRenderBridge takes over the render loop: when XR is active it
          calls XR8.runPreRender → gl.render → XR8.runPostRender each frame.
          When XR is inactive, it just renders normally. */}
      <XRRenderBridge />

      {/* XRCameraBackground renders the device camera feed as a fullscreen
          background mesh. It only appears when an XR session is active. */}
      <XRCameraBackground />

      {/* Scene content */}
      <ARContent />

      {/* Standard R3F lighting -- works the same as any R3F app */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
    </XRProvider>
  )
}

/**
 * ARContent -- Scene content that uses XR hooks.
 *
 * Separated from ARScene because hooks must be called inside XRProvider.
 */
function ARContent() {
  const { isReady, status: engineStatus, error } = useXREngine()
  const { start, stop } = useXRSession()

  // Start a SLAM session as soon as the engine is ready
  useEffect(() => {
    if (!isReady) return

    start({ mode: 'slam', cameraDirection: 'back' })

    // Stop the session when this component unmounts.
    // This releases the camera and cleans up pipeline modules.
    return () => {
      stop()
    }
  }, [isReady, start, stop])

  // Log status for debugging (check browser console)
  useEffect(() => {
    if (error) {
      console.error('[ARContent] Engine error:', error.message)
    } else {
      console.log('[ARContent] Engine status:', engineStatus)
    }
  }, [engineStatus, error])

  // Place a rotating box 2 meters in front of the camera
  return <RotatingBox position={[0, 0, -2]} />
}
