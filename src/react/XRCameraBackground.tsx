/**
 * XRCameraBackground - Fullscreen camera feed background mesh.
 *
 * Renders a fullscreen quad behind all scene content that displays the
 * device camera feed. Uses a custom shader that positions the quad in NDC
 * space so it always fills the viewport regardless of camera state.
 *
 * Only visible when an XR session is active. Returns null otherwise.
 *
 * Usage:
 *   <XRProvider>
 *     <XRRenderBridge />
 *     <XRCameraBackground />
 *     <YourScene />
 *   </XRProvider>
 */

import { useRef, useEffect, useState } from 'react'
import { ShaderMaterial, PlaneGeometry } from 'three'
import { useXRContext } from './XRProvider'
import type { SessionManagerState } from '../core/session-manager'

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  // Position directly in NDC space - fills the entire viewport
  gl_Position = vec4(position.xy * 2.0, -1.0, 1.0);
}
`

const FRAGMENT_SHADER = `
uniform sampler2D map;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(map, vUv);
}
`

export interface XRCameraBackgroundProps {
  /** Render order for the background mesh. Lower renders first. Default: -1000 */
  renderOrder?: number
}

export function XRCameraBackground({
  renderOrder = -1000,
}: XRCameraBackgroundProps) {
  const { sessionManager, cameraFeedTexture } = useXRContext()
  const materialRef = useRef<ShaderMaterial>(null)

  // Track whether session is active for conditional rendering
  const [isActive, setIsActive] = useState(
    sessionManager.getState().status === 'active',
  )

  useEffect(() => {
    const unsubscribe = sessionManager.subscribe((state: SessionManagerState) => {
      setIsActive(state.status === 'active')
    })
    return unsubscribe
  }, [sessionManager])

  // Update the texture uniform when it changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.map.value = cameraFeedTexture
    }
  }, [cameraFeedTexture])

  if (!isActive) return null

  return (
    <mesh renderOrder={renderOrder} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        depthTest={false}
        depthWrite={false}
        uniforms={{
          map: { value: cameraFeedTexture },
        }}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
      />
    </mesh>
  )
}
