/**
 * App -- The application shell.
 *
 * The Canvas is created once here at the layout level and persists for
 * the lifetime of the app. This is the recommended pattern for apps
 * where multiple scenes may share a single canvas.
 *
 * The HTML overlay sits outside the Canvas and shows status information.
 * In a production app you'd use a shared store (e.g. Zustand) to bridge
 * state between inside-Canvas components and outside-Canvas UI. Here we
 * keep it simple with a static message.
 */

import { Canvas } from '@react-three/fiber'
import { ARScene } from './components/ARScene'

const ENGINE_URL = import.meta.env.VITE_XR8_ENGINE_URL as string

export function App() {
  return (
    <>
      {/* Full-viewport Canvas -- created once, never unmounted */}
      <Canvas
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ARScene />
      </Canvas>

      {/* HTML status overlay */}
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
          zIndex: 1000,
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
