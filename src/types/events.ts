/**
 * Typed event map for all XR events flowing through the bridge.
 *
 * Events are emitted by pipeline module listeners and the session manager,
 * consumed by the `useXREvent` hook.
 */

// -- Image Target Events --

export interface ImageTargetDetail {
  name: string
  type: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number; w: number }
  scale: number
  scaledWidth: number
  scaledHeight: number
  height?: number
  radiusTop?: number
  radiusBottom?: number
  arcStartRadians?: number
  arcLengthRadians?: number
  metadata?: Record<string, unknown>
}

export interface ImageTargetListDetail {
  imageTargets: Array<{
    name: string
    type: string
    metadata: Record<string, unknown>
    geometry?: Record<string, unknown>
  }>
}

// -- Face Tracking Events --

export interface FaceLoadingDetail {
  maxDetections: number
  pointsPerDetection: number
  indices: Uint16Array
  uvs: Float32Array
}

export interface FaceDetail {
  id: number
  transform: {
    position: { x: number; y: number; z: number }
    rotation: { x: number; y: number; z: number; w: number }
    scale: number
    mirror: boolean
  }
  vertices: Float32Array
  normals: Float32Array
  attachmentPoints: Record<
    string,
    { position: { x: number; y: number; z: number } }
  >
}

export interface FaceLostDetail {
  id: number
}

export interface FaceMouthDetail {
  id: number
}

// -- Tracking Status --

export interface TrackingStatusDetail {
  status: string
  reason?: string
}

// -- Session Events --

export interface SessionErrorDetail {
  error: Error
  code: string
}

// -- Complete Event Map --

export interface XREventMap {
  // Image targets
  'reality.imageloading': ImageTargetListDetail
  'reality.imagescanning': ImageTargetListDetail
  'reality.imagefound': ImageTargetDetail
  'reality.imageupdated': ImageTargetDetail
  'reality.imagelost': ImageTargetDetail

  // Face tracking
  'face.faceloading': FaceLoadingDetail
  'face.facescanning': FaceLoadingDetail
  'face.facefound': FaceDetail
  'face.faceupdated': FaceDetail
  'face.facelost': FaceLostDetail
  'face.mouthopened': FaceMouthDetail

  // Tracking status
  'tracking.status': TrackingStatusDetail

  // Session lifecycle
  'session.started': undefined
  'session.stopped': undefined
  'session.paused': undefined
  'session.resumed': undefined
  'session.error': SessionErrorDetail

  // Camera permissions
  'camera.permissionDenied': undefined
  'camera.permissionGranted': undefined

  // Engine lifecycle
  'engine.loaded': undefined
  'engine.error': SessionErrorDetail
}
