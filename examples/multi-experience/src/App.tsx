/**
 * App -- Multi-experience application shell.
 *
 * This is the flagship example demonstrating the core use case:
 * multiple experiences sharing a single Canvas with mode switching.
 *
 * Architecture:
 * - A single Canvas is created ONCE and never unmounted
 * - XRProvider wraps all content with autoLoad={false} -- the engine
 *   is only downloaded when the user first navigates to an AR experience
 * - The "3D Viewer" experience works immediately without any engine
 * - Switching experiences unmounts/remounts via key-based rendering,
 *   ensuring proper cleanup of sessions and event subscriptions
 */

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { XRProvider, XRRenderBridge, XRCameraBackground } from '@xr-engine/r3f-bridge'
import { ExperienceRouter } from './components/ExperienceRouter'
import { Navigation } from './components/Navigation'
import { LoadingOverlay } from './components/LoadingScreen'

export type ExperienceMode = 'slam' | 'face' | 'non-xr'

const ENGINE_URL = import.meta.env.VITE_XR8_ENGINE_URL as string
const EXTRAS_URL = import.meta.env.VITE_XR8_EXTRAS_URL as string

const engineConfig = {
  engineUrl: ENGINE_URL || undefined,
  extrasUrl: EXTRAS_URL || undefined,
  preloadChunks: ['face'],
}

export function App() {
  const [experience, setExperience] = useState<ExperienceMode>('non-xr')

  return (
    <>
      {/* Single Canvas -- created once, shared across all experiences */}
      <Canvas
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* autoLoad={false}: engine loads on-demand when first AR mode starts.
            The non-XR viewer works without downloading the engine at all. */}
        <XRProvider engineConfig={engineConfig} autoLoad={false}>
          <XRRenderBridge />
          <XRCameraBackground />
          <ExperienceRouter current={experience} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          {/* LoadingOverlay uses XR hooks to read engine/session status,
              then portals HTML to document.body for display above Canvas */}
          <LoadingOverlay />
        </XRProvider>
      </Canvas>

      {/* HTML overlays -- outside Canvas */}
      <Navigation current={experience} onChange={setExperience} />
    </>
  )
}
