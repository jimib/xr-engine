/**
 * ScanningOverlay -- "Point camera at image" prompt.
 *
 * Shown when no image targets are currently detected. Disappears
 * when the engine fires `reality.imagefound`.
 */

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 999,
}

const crosshairStyle: React.CSSProperties = {
  width: 120,
  height: 120,
  border: '3px solid rgba(255, 255, 255, 0.6)',
  borderRadius: 12,
  marginBottom: 24,
}

const textStyle: React.CSSProperties = {
  color: 'white',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '16px',
  textAlign: 'center',
  textShadow: '0 1px 4px rgba(0,0,0,0.7)',
  padding: '0 32px',
}

export function ScanningOverlay() {
  return (
    <div style={overlayStyle}>
      <div style={crosshairStyle} />
      <div style={textStyle}>
        Point your camera at the target image
      </div>
      <div style={{ ...textStyle, fontSize: '13px', opacity: 0.7, marginTop: 8 }}>
        Make sure the image is well-lit and fully visible
      </div>
    </div>
  )
}
