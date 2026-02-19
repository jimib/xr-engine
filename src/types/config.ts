/**
 * Configuration types for the XR engine and sessions.
 */

import type { FaceMeshGeometry, XR8AllowedDevices } from './xr8'

export type XRSessionMode = 'slam' | 'face' | 'image-target'
export type XRSessionStatus =
  | 'inactive'
  | 'starting'
  | 'active'
  | 'paused'
  | 'stopping'
export type XREngineStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface XRSessionConfig {
  /** The AR mode to use */
  mode: XRSessionMode
  /** Camera direction: 'front' for selfie/face, 'back' for world/SLAM */
  cameraDirection?: 'front' | 'back'

  // SLAM-specific
  /** Disable world tracking (required when using front camera without face tracking) */
  disableWorldTracking?: boolean
  /** Enable lighting estimation */
  enableLighting?: boolean
  /** Enable world points / point cloud */
  enableWorldPoints?: boolean
  /** Scale mode for SLAM */
  scale?: 'responsive' | 'absolute'

  // Face-specific
  /** Max simultaneous face detections */
  maxFaceDetections?: number
  /** Face mesh geometry types to track */
  faceMeshGeometry?: FaceMeshGeometry[]
  /** Mirror the face display (for front-facing camera) */
  mirroredDisplay?: boolean

  // Image target
  /** List of image target names to track */
  imageTargets?: string[]

  // Sky effects
  /** Enable sky/layers controller */
  enableSky?: boolean
}

export interface XREngineConfig {
  /** URL to the 8th Wall engine script. If omitted, assumes XR8 is already on window. */
  engineUrl?: string
  /** URL to the XRExtras script. If omitted, assumes XRExtras is already on window. */
  extrasUrl?: string
  /** Chunks to preload when the engine loads: 'slam', 'face', 'hand' */
  preloadChunks?: string[]
  /** Prefer WebGL2 context */
  webgl2?: boolean
  /** Allowed devices */
  allowedDevices?: XR8AllowedDevices
}
