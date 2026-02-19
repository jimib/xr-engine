/**
 * XRRenderBridge - Takes over R3F's render loop to orchestrate XR rendering.
 *
 * Uses `useFrame` with priority 1 to disable R3F's automatic rendering.
 * When XR is active, wraps the render call with XR8.runPreRender/runPostRender
 * so that tracking data is processed before rendering and cleanup happens after.
 *
 * When XR is inactive, renders normally so non-XR experiences work seamlessly
 * on the same canvas.
 *
 * Usage:
 *   <XRProvider>
 *     <XRRenderBridge />
 *     <YourScene />
 *   </XRProvider>
 */

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useXRContext } from './XRProvider'
import type { SessionManagerState } from '../core/session-manager'

export function XRRenderBridge() {
  const { gl, scene, camera } = useThree()
  const { sessionManager } = useXRContext()

  // Track session status in a ref to avoid re-renders on every status change.
  // The render loop reads this ref every frame.
  const statusRef = useRef<SessionManagerState['status']>('inactive')

  useEffect(() => {
    // Initialize from current state
    statusRef.current = sessionManager.getState().status

    // Subscribe to state changes
    const unsubscribe = sessionManager.subscribe((state) => {
      statusRef.current = state.status
    })

    return unsubscribe
  }, [sessionManager])

  // Priority 1 takes over the render loop from R3F.
  // When this component unmounts, R3F resumes auto-rendering.
  useFrame((state) => {
    const sessionStatus = statusRef.current
    const timestamp = state.clock.getElapsedTime() * 1000

    if (sessionStatus === 'active') {
      // --- XR Active Render Path ---
      // 1. Process camera frame: texture upload, SLAM/face tracking, camera pose update
      window.XR8!.runPreRender(timestamp)

      // 2. Render the scene (camera background mesh + 3D content)
      //    The camera has been updated by the bridge pipeline module's onUpdate
      gl.render(scene, camera)

      // 3. Post-render cleanup
      window.XR8!.runPostRender(timestamp)
    } else {
      // --- Non-XR Render Path ---
      // Covers: inactive, starting, stopping, paused
      gl.render(scene, camera)
    }
  }, 1)

  // This component renders nothing to the scene graph
  return null
}
