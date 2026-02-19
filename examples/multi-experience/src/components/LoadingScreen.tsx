/**
 * LoadingScreen -- HTML overlay showing engine/session loading state.
 *
 * Reads XR engine and session status via hooks and shows appropriate
 * loading UI. This component is rendered outside the Canvas in
 * regular DOM but needs to access XR state.
 *
 * Since it sits outside the Canvas, it cannot use R3F hooks directly.
 * Instead, we use a portal-style pattern: the loading state is
 * rendered by a child component inside XRProvider (via the Canvas),
 * but since we want HTML overlay we track it with a simple polling approach
 * reading from the XRProvider's internal state.
 *
 * For simplicity in this example, we show a basic CSS spinner overlay
 * that's controlled from App.tsx.
 */

import { useXREngine, useXRSession } from '@xr-engine/r3f-bridge'
import { createPortal } from 'react-dom'

/**
 * LoadingOverlay -- Rendered inside XRProvider (in the Canvas tree)
 * but uses createPortal to show HTML in the document body.
 *
 * This pattern lets us use XR hooks while rendering DOM elements.
 */
export function LoadingScreen() {
  // This component is rendered OUTSIDE the Canvas, so it cannot
  // use XR hooks. Instead, we provide a companion component
  // (LoadingScreenInner) that should be placed inside XRProvider.
  // For this example, we show a static loading screen that's
  // controlled by the experience components.
  return null
}

/**
 * Place this inside XRProvider to get a loading overlay that reads
 * engine/session status via hooks.
 *
 * Usage:
 *   <XRProvider ...>
 *     <LoadingOverlay />
 *     ...
 *   </XRProvider>
 *
 * Not used in the current App.tsx setup to keep things simple,
 * but available for reference.
 */
export function LoadingOverlay() {
  const { status: engineStatus, error: engineError } = useXREngine()
  const { status: sessionStatus } = useXRSession()

  const isLoading = engineStatus === 'loading' || sessionStatus === 'starting'
  const hasError = engineError != null

  if (!isLoading && !hasError) return null

  const overlay = (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.7)',
      zIndex: 999,
      pointerEvents: 'none',
    }}>
      {hasError ? (
        <div style={{
          color: '#ff4444',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '16px',
          textAlign: 'center',
          padding: '0 32px',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Error</div>
          <div>{engineError?.message || 'An unknown error occurred'}</div>
        </div>
      ) : (
        <>
          {/* CSS spinner */}
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(255,255,255,0.2)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: 16,
          }} />
          <div style={{
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px',
          }}>
            {engineStatus === 'loading' && 'Loading XR engine...'}
            {sessionStatus === 'starting' && 'Starting camera...'}
          </div>
          {/* Inline keyframes for the spinner */}
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </>
      )}
    </div>
  )

  // Portal to document.body so it renders above the Canvas
  return createPortal(overlay, document.body)
}
