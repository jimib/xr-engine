/**
 * FaceDebugOverlay -- HTML overlay showing raw face tracking data.
 *
 * This component renders outside the Canvas (in regular React DOM).
 * It displays face tracking state, available attachment point names,
 * and the face transform data. Useful for discovering which attachment
 * point names are available from the engine at runtime.
 */

import type { FaceDetail } from '@xr-engine/r3f-bridge'

interface FaceDebugOverlayProps {
  faceData: FaceDetail | null
  faceVisible: boolean
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  maxHeight: '40vh',
  overflow: 'auto',
  background: 'rgba(0, 0, 0, 0.75)',
  color: '#0f0',
  fontFamily: 'monospace',
  fontSize: '11px',
  padding: '12px',
  zIndex: 1000,
}

export function FaceDebugOverlay({ faceData, faceVisible }: FaceDebugOverlayProps) {
  return (
    <div style={overlayStyle}>
      <div><strong>Face Tracking Debug</strong></div>
      <div>Status: {faceVisible ? 'TRACKING' : 'NO FACE DETECTED'}</div>

      {faceData && (
        <>
          <div>Face ID: {faceData.id}</div>
          <div>
            Position: ({faceData.transform.position.x.toFixed(3)},{' '}
            {faceData.transform.position.y.toFixed(3)},{' '}
            {faceData.transform.position.z.toFixed(3)})
          </div>
          <div>Scale: {faceData.transform.scale.toFixed(3)}</div>
          <div>Mirror: {String(faceData.transform.mirror)}</div>

          <div style={{ marginTop: 8 }}>
            <strong>Attachment Points ({Object.keys(faceData.attachmentPoints).length}):</strong>
          </div>
          {Object.entries(faceData.attachmentPoints).map(([name, point]) => (
            <div key={name} style={{ paddingLeft: 8 }}>
              {name}: ({point.position.x.toFixed(3)}, {point.position.y.toFixed(3)}, {point.position.z.toFixed(3)})
            </div>
          ))}
        </>
      )}
    </div>
  )
}
