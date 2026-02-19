/**
 * NonXRExperience -- Pure R3F scene, no XR at all.
 *
 * Demonstrates that the same Canvas works for non-XR content when
 * no XR session is running. Uses OrbitControls from drei for
 * mouse/touch camera control.
 *
 * This experience works immediately without downloading the 8th Wall
 * engine, making it a great default landing experience.
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Mesh } from 'three'

export function NonXRExperience() {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15
      meshRef.current.rotation.y += delta * 0.25
    }
  })

  return (
    <>
      {/* OrbitControls -- standard mouse/touch camera control */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={10}
      />

      {/* Wireframe dodecahedron */}
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#6644ff"
          wireframe
          emissive="#6644ff"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Grid for spatial reference */}
      <gridHelper args={[10, 20, '#333333', '#222222']} />

      {/* Extra lighting for the non-XR scene */}
      <pointLight position={[-3, 3, -3]} intensity={0.5} color="#ff8844" />
    </>
  )
}
