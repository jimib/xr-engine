/**
 * App -- Image targets application shell.
 *
 * The Canvas is created once at the layout level. The ScanningOverlay
 * sits outside the Canvas and prompts the user to point their camera
 * at a target image.
 */

import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { ImageTargetScene } from './components/ImageTargetScene'
import { ScanningOverlay } from './components/ScanningOverlay'

const ENGINE_URL = import.meta.env.VITE_XR8_ENGINE_URL as string

export function App() {
  const [scanning, setScanning] = useState(true)

  const handleScanningChange = useCallback((isScanning: boolean) => {
    setScanning(isScanning)
  }, [])

  return (
    <>
      {/* Full-viewport Canvas */}
      <Canvas
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ImageTargetScene onScanningChange={handleScanningChange} />
      </Canvas>

      {/* Scanning prompt -- shown when no targets are detected */}
      {scanning && <ScanningOverlay />}

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
