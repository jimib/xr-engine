/**
 * FaceExperience -- Face AR experience using face tracking.
 *
 * Same on-demand loading pattern as SlamExperience. Starts a face
 * tracking session with front camera and subscribes to face events.
 *
 * Shows simple spheres at face attachment points to demonstrate
 * tracking data is flowing correctly.
 */

import { useState, useEffect } from 'react'
import { useXREngine, useXRSession, useXREvent } from '@xr-engine/r3f-bridge'
import type { FaceDetail } from '@xr-engine/r3f-bridge'

export function FaceExperience() {
  const { status: engineStatus, isReady, load } = useXREngine()
  const { start, stop } = useXRSession()
  const [faceData, setFaceData] = useState<FaceDetail | null>(null)
  const [faceVisible, setFaceVisible] = useState(false)

  // Load the engine on demand
  useEffect(() => {
    if (engineStatus === 'idle') {
      load()
    }
  }, [engineStatus, load])

  // Start face tracking session once the engine is ready
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

  // Face events
  useXREvent('face.facefound', (detail: FaceDetail) => {
    setFaceData(detail)
    setFaceVisible(true)
  })

  useXREvent('face.faceupdated', (detail: FaceDetail) => {
    setFaceData(detail)
  })

  useXREvent('face.facelost', () => {
    setFaceVisible(false)
  })

  if (!faceVisible || !faceData) return null

  const { transform, attachmentPoints } = faceData

  return (
    <group
      position={[transform.position.x, transform.position.y, transform.position.z]}
      quaternion={[transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w]}
      scale={transform.scale}
    >
      {/* Left eye */}
      {attachmentPoints.leftEye && (
        <mesh position={[
          attachmentPoints.leftEye.position.x,
          attachmentPoints.leftEye.position.y,
          attachmentPoints.leftEye.position.z,
        ]}>
          <sphereGeometry args={[0.012, 16, 16]} />
          <meshStandardMaterial color="#ff4444" />
        </mesh>
      )}

      {/* Right eye */}
      {attachmentPoints.rightEye && (
        <mesh position={[
          attachmentPoints.rightEye.position.x,
          attachmentPoints.rightEye.position.y,
          attachmentPoints.rightEye.position.z,
        ]}>
          <sphereGeometry args={[0.012, 16, 16]} />
          <meshStandardMaterial color="#ff4444" />
        </mesh>
      )}

      {/* Nose tip */}
      {attachmentPoints.noseTip && (
        <mesh position={[
          attachmentPoints.noseTip.position.x,
          attachmentPoints.noseTip.position.y,
          attachmentPoints.noseTip.position.z,
        ]}>
          <sphereGeometry args={[0.01, 16, 16]} />
          <meshStandardMaterial color="#ffff44" />
        </mesh>
      )}
    </group>
  )
}
