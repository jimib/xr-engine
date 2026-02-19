/**
 * RotatingBox -- A simple animated 3D object.
 *
 * Demonstrates that standard R3F useFrame animations work seamlessly
 * alongside the XR render bridge. useFrame callbacks at priority 0
 * (the default) run before the bridge's priority 1 render call.
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

interface RotatingBoxProps {
  position?: [number, number, number]
}

export function RotatingBox({ position = [0, 0, -2] }: RotatingBoxProps) {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  )
}
