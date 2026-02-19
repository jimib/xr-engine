/**
 * FaceScene -- Face tracking AR experience inside the Canvas.
 *
 * This component sets up XRProvider with face tracking configuration,
 * subscribes to face events (facefound / faceupdated / facelost),
 * and renders 3D face content when a face is detected.
 *
 * The onFaceUpdate callback is used to forward face data to App.tsx
 * for the HTML debug overlay (which lives outside the Canvas).
 */

import { useState, useEffect, useCallback } from 'react'
import {
  XRProvider,
  XRRenderBridge,
  XRCameraBackground,
  useXREngine,
  useXRSession,
  useXREvent,
} from '@xr-engine/r3f-bridge'
import type { FaceDetail } from '@xr-engine/r3f-bridge'
import { FaceMask } from './FaceMask'

const ENGINE_URL = import.meta.env.VITE_XR8_ENGINE_URL as string
const EXTRAS_URL = import.meta.env.VITE_XR8_EXTRAS_URL as string

const engineConfig = {
  engineUrl: ENGINE_URL || undefined,
  extrasUrl: EXTRAS_URL || undefined,
  preloadChunks: ['face'],
}

interface FaceSceneProps {
  onFaceUpdate?: (data: FaceDetail | null, visible: boolean) => void
}

export function FaceScene({ onFaceUpdate }: FaceSceneProps) {
  return (
    <XRProvider engineConfig={engineConfig} autoLoad>
      <XRRenderBridge />
      <XRCameraBackground />
      <FaceContent onFaceUpdate={onFaceUpdate} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 5, 5]} intensity={0.8} />
    </XRProvider>
  )
}

/**
 * FaceContent -- Uses XR hooks to manage the face session and events.
 *
 * Must be a child of XRProvider so that hooks have access to the XR context.
 */
function FaceContent({ onFaceUpdate }: { onFaceUpdate?: (data: FaceDetail | null, visible: boolean) => void }) {
  const { isReady, status: engineStatus, error } = useXREngine()
  const { start, stop } = useXRSession()
  const [faceData, setFaceData] = useState<FaceDetail | null>(null)
  const [faceVisible, setFaceVisible] = useState(false)

  // Start a face tracking session when the engine is ready
  useEffect(() => {
    if (!isReady) return

    start({
      mode: 'face',
      cameraDirection: 'front',
      maxFaceDetections: 1,
      faceMeshGeometry: ['face'],
      mirroredDisplay: true,
    })

    return () => {
      stop()
    }
  }, [isReady, start, stop])

  // Log status for debugging
  useEffect(() => {
    if (error) {
      console.error('[FaceContent] Engine error:', error.message)
    } else {
      console.log('[FaceContent] Engine status:', engineStatus)
    }
  }, [engineStatus, error])

  // Forward face data to the parent (for the debug overlay outside Canvas)
  const reportFace = useCallback(
    (data: FaceDetail | null, visible: boolean) => {
      onFaceUpdate?.(data, visible)
    },
    [onFaceUpdate],
  )

  // Face found -- start tracking
  useXREvent('face.facefound', (detail: FaceDetail) => {
    setFaceData(detail)
    setFaceVisible(true)
    reportFace(detail, true)
  })

  // Face updated -- update tracking data every frame
  useXREvent('face.faceupdated', (detail: FaceDetail) => {
    setFaceData(detail)
    reportFace(detail, true)
  })

  // Face lost -- stop tracking
  useXREvent('face.facelost', () => {
    setFaceVisible(false)
    reportFace(faceData, false)
  })

  return (
    <>
      {faceVisible && faceData && <FaceMask faceData={faceData} />}
    </>
  )
}
