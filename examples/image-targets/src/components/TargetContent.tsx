/**
 * TargetContent -- 3D content anchored to a detected image target.
 *
 * Receives ImageTargetDetail as a prop with position, rotation, and
 * scale from the engine. Renders a group at that world-space transform
 * with child 3D content (a translucent box hovering above the image).
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { ImageTargetDetail } from '@xr-engine/r3f-bridge'

interface TargetContentProps {
  target: ImageTargetDetail
}

export function TargetContent({ target }: TargetContentProps) {
  const meshRef = useRef<Mesh>(null)

  // Gentle floating animation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group
      position={[target.position.x, target.position.y, target.position.z]}
      quaternion={[target.rotation.x, target.rotation.y, target.rotation.z, target.rotation.w]}
    >
      {/* Flat plane matching the image target footprint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[target.scaledWidth, target.scaledHeight]} />
        <meshStandardMaterial color="#4488ff" opacity={0.3} transparent />
      </mesh>

      {/* Box floating above the target */}
      <mesh
        ref={meshRef}
        position={[0, target.scaledHeight * 0.5, 0]}
      >
        <boxGeometry args={[
          target.scaledWidth * 0.4,
          target.scaledWidth * 0.4,
          target.scaledWidth * 0.4,
        ]} />
        <meshStandardMaterial color="#ff8844" />
      </mesh>
    </group>
  )
}
