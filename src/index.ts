/**
 * @xr-engine/r3f-bridge
 *
 * Single-canvas bridge between 8th Wall XR engine and React Three Fiber.
 *
 * Eliminates the dual-canvas architecture by letting R3F own the canvas while
 * 8th Wall provides AR tracking and camera feed on that same canvas.
 */

// -- React Components --
export { XRProvider, useXRContext } from './react/XRProvider'
export type { XRProviderProps, XRContextValue } from './react/XRProvider'

export { XRRenderBridge } from './react/XRRenderBridge'

export { XRCameraBackground } from './react/XRCameraBackground'
export type { XRCameraBackgroundProps } from './react/XRCameraBackground'

// -- React Hooks --
export { useXREngine } from './react/hooks/useXREngine'
export type { UseXREngineResult } from './react/hooks/useXREngine'

export { useXRSession } from './react/hooks/useXRSession'
export type { UseXRSessionResult } from './react/hooks/useXRSession'

export { useXREvent } from './react/hooks/useXREvent'

export { useXRStore } from './react/hooks/useXRStore'

// -- Core (for advanced users building custom integrations) --
export { loadEngine, getXR8, resetLoader } from './core/engine-loader'

export { createR3FBridgePipelineModule } from './core/pipeline-module'
export type { R3FBridgeConfig } from './core/pipeline-module'

export { createCameraTexturePipelineModule } from './core/camera-texture'
export type { CameraTextureConfig, CameraTextureResult } from './core/camera-texture'

export { createSessionManager } from './core/session-manager'
export type { SessionManager, SessionManagerConfig, SessionManagerState } from './core/session-manager'

export {
  XREventEmitter,
  createEventBridgePipelineModule,
  createCameraStatusPipelineModule,
} from './core/event-emitter'

// -- Types --
export type {
  // XR8 API types
  XR8Static,
  XR8PipelineModule,
  XR8RunConfig,
  ProcessCpuResult,
  FrameStartResult,
  RealityResult,
  FaceControllerResult,
  PipelineStartArgs,
  PipelineUpdateArgs,
  XrControllerConfig,
  FaceControllerConfig,
  FaceMeshGeometry,

  // Event types
  XREventMap,
  ImageTargetDetail,
  FaceDetail,
  FaceLostDetail,
  FaceLoadingDetail,
  TrackingStatusDetail,
  SessionErrorDetail,

  // Config types
  XRSessionMode,
  XRSessionStatus,
  XREngineStatus,
  XRSessionConfig,
  XREngineConfig,
} from './types'
