/**
 * SlamExperience -- World AR experience using SLAM tracking.
 *
 * Demonstrates on-demand engine loading: if the engine hasn't been
 * loaded yet (status is 'idle'), this component triggers loading.
 * Once loaded, it starts a SLAM session with back camera.
 *
 * On unmount, the session is stopped (releasing the camera) so the
 * next experience can start fresh.
 */

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { useXREngine, useXRSession } from '@xr-engine/r3f-bridge'

export function SlamExperience() {
  const { status: engineStatus, isReady, load } = useXREngine()
  const { start, stop } = useXRSession()
  const meshRef = useRef<Mesh>(null)

  // Load the engine on demand if it hasn't been loaded yet
  useEffect(() => {
    if (engineStatus === 'idle') {
      load()
    }
  }, [engineStatus, load])

  // Start SLAM session once the engine is ready
  useEffect(() => {
    if (!isReady) return

    start({
      mode: 'slam',
      cameraDirection: 'back',
      enableLighting: true,
    })

    // Stop the session on unmount -- releases the camera
    return () => {
      stop()
    }
  }, [isReady, start, stop])

  // Animate the torus knot
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -3]}>
      <torusKnotGeometry args={[0.3, 0.1, 128, 32]} />
      <meshStandardMaterial color="#ff6644" roughness={0.3} metalness={0.6} />
    </mesh>
  )
}
