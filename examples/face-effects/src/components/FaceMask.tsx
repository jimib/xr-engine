/**
 * FaceMask -- 3D objects positioned at face attachment points.
 *
 * 8th Wall provides named attachment points on the detected face, such as
 * "leftEye", "rightEye", "noseBridge", "forehead", etc. This component
 * places simple 3D objects at those positions to demonstrate face effects.
 *
 * The FaceDetail.transform gives the overall face position/rotation in world
 * space. Each attachment point position is relative to the face transform.
 */

import type { FaceDetail } from '@xr-engine/r3f-bridge'

interface FaceMaskProps {
  faceData: FaceDetail
}

export function FaceMask({ faceData }: FaceMaskProps) {
  const { transform, attachmentPoints } = faceData

  return (
    <group
      position={[
        transform.position.x,
        transform.position.y,
        transform.position.z,
      ]}
      quaternion={[
        transform.rotation.x,
        transform.rotation.y,
        transform.rotation.z,
        transform.rotation.w,
      ]}
      scale={transform.scale}
    >
      {/* Left eye -- red sphere */}
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

      {/* Right eye -- red sphere */}
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

      {/* Nose bridge -- blue sphere */}
      {attachmentPoints.noseBridge && (
        <mesh position={[
          attachmentPoints.noseBridge.position.x,
          attachmentPoints.noseBridge.position.y,
          attachmentPoints.noseBridge.position.z,
        ]}>
          <sphereGeometry args={[0.008, 16, 16]} />
          <meshStandardMaterial color="#4488ff" />
        </mesh>
      )}

      {/* Forehead -- green sphere */}
      {attachmentPoints.forehead && (
        <mesh position={[
          attachmentPoints.forehead.position.x,
          attachmentPoints.forehead.position.y,
          attachmentPoints.forehead.position.z,
        ]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#44ff44" />
        </mesh>
      )}

      {/* Nose tip -- yellow sphere */}
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
