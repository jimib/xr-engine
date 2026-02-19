/**
 * App -- Face effects application shell.
 *
 * The Canvas is created once at the layout level. The FaceDebugOverlay
 * sits outside the Canvas (in regular DOM) and displays raw face data
 * forwarded from inside-Canvas components via a callback.
 */

import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import type { FaceDetail } from '@xr-engine/r3f-bridge'
import { FaceScene } from './components/FaceScene'
import { FaceDebugOverlay } from './components/FaceDebugOverlay'

const ENGINE_URL = import.meta.env.VITE_XR8_ENGINE_URL as string

export function App() {
  const [faceData, setFaceData] = useState<FaceDetail | null>(null)
  const [faceVisible, setFaceVisible] = useState(false)

  const handleFaceUpdate = useCallback((data: FaceDetail | null, visible: boolean) => {
    setFaceData(data)
    setFaceVisible(visible)
  }, [])

  return (
    <>
      {/* Full-viewport Canvas */}
      <Canvas
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{ alpha: true, antialias: true }}
      >
        <FaceScene onFaceUpdate={handleFaceUpdate} />
      </Canvas>

      {/* Debug overlay showing raw face tracking data */}
      <FaceDebugOverlay faceData={faceData} faceVisible={faceVisible} />

      {/* Error overlay for missing engine URL */}
      {!ENGINE_URL && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px',
          background: 'rgba(220, 50, 50, 0.9)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          zIndex: 1001,
          textAlign: 'center',
        }}>
          <strong>Missing engine URL.</strong> Copy{' '}
          <code>.env.example</code> to <code>.env.local</code> and set{' '}
          <code>VITE_XR8_ENGINE_URL</code> to your 8th Wall engine script path.
        </div>
      )}
    </>
  )
}
