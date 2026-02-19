/**
 * TypeScript declarations for the 8th Wall XR8 engine API.
 *
 * These types cover the public API surface used by the R3F bridge.
 * The 8th Wall engine is loaded at runtime and exposed as `window.XR8`.
 */

// -- Pipeline Module Lifecycle Arguments --

export interface PipelineStartArgs {
  canvas: HTMLCanvasElement
  canvasWidth: number
  canvasHeight: number
  GLctx: WebGLRenderingContext | WebGL2RenderingContext
  config: Record<string, unknown>
}

export interface PipelineAttachArgs {
  canvas: HTMLCanvasElement
  canvasWidth: number
  canvasHeight: number
  GLctx: WebGLRenderingContext | WebGL2RenderingContext
  framework: Record<string, unknown>
  stream: MediaStream
  video: HTMLVideoElement
  version: string
  imageTargets?: Array<{ name: string; type: string; metadata: unknown }>
  config: Record<string, unknown>
}

export interface PipelineDetachArgs {
  framework: Record<string, unknown>
}

export interface FrameStartResult {
  cameraTexture: WebGLTexture | null
  GLctx: WebGLRenderingContext | WebGL2RenderingContext
  textureWidth: number
  textureHeight: number
  videoTime: number
  mirror: boolean
}

export interface RealityResult {
  rotation: { x: number; y: number; z: number; w: number }
  position: { x: number; y: number; z: number }
  intrinsics: number[] | Float32Array
  trackingStatus: string
  trackingReason?: string
  worldPoints?: Array<{
    position: { x: number; y: number; z: number }
    confidence: number
  }>
  lighting?: {
    exposure: number
    temperature: number
  }
  realityTexture?: WebGLTexture
}

export interface FaceControllerResult {
  rotation: { x: number; y: number; z: number; w: number }
  position: { x: number; y: number; z: number }
  intrinsics: number[] | Float32Array
}

export interface ProcessCpuResult {
  reality?: RealityResult
  facecontroller?: FaceControllerResult
  handcontroller?: Record<string, unknown>
  layerscontroller?: Record<string, unknown>
}

export interface PipelineUpdateArgs {
  framework: Record<string, unknown>
  processCpuResult: ProcessCpuResult
  frameStartResult: FrameStartResult
}

export interface PipelineProcessGpuArgs {
  framework: Record<string, unknown>
  frameStartResult: FrameStartResult
}

export interface PipelineProcessCpuArgs {
  framework: Record<string, unknown>
  processGpuResult: Record<string, unknown>
  frameStartResult: FrameStartResult
}

export interface PipelineCanvasSizeChangeArgs {
  canvasWidth: number
  canvasHeight: number
  videoWidth: number
  videoHeight: number
}

export interface CameraStatusChangeArgs {
  status: 'requesting' | 'hasStream' | 'hasVideo' | 'failed'
  stream?: MediaStream
  video?: HTMLVideoElement
  config: Record<string, unknown>
}

// -- Pipeline Module Interface --

export interface PipelineModuleListener {
  event: string
  process: (detail: unknown) => void
}

export interface XR8PipelineModule {
  name: string
  onBeforeRun?: () => void
  onCameraStatusChange?: (args: CameraStatusChangeArgs) => void
  onStart?: (args: PipelineStartArgs) => void
  onAttach?: (args: PipelineAttachArgs) => void
  onDetach?: (args?: PipelineDetachArgs) => void
  onProcessGpu?: (args: PipelineProcessGpuArgs) => void
  onProcessCpu?: (args: PipelineProcessCpuArgs) => void
  onUpdate?: (args: PipelineUpdateArgs) => void
  onRender?: () => void
  onCanvasSizeChange?: (args: PipelineCanvasSizeChangeArgs) => void
  onException?: (error: Error) => void
  onVideoSizeChange?: (args: { videoWidth: number; videoHeight: number }) => void
  listeners?: PipelineModuleListener[]
}

// -- XR8 Run Configuration --

export interface XR8RunConfig {
  canvas: HTMLCanvasElement
  webgl2?: boolean
  ownRunLoop?: boolean
  cameraConfig?: {
    direction?: XR8CameraDirection
  }
  glContextConfig?: WebGLContextAttributes
  allowedDevices?: XR8AllowedDevices
  sessionConfiguration?: Record<string, unknown>
}

// -- XR Controller Configuration --

export interface XrControllerConfig {
  disableWorldTracking?: boolean
  enableLighting?: boolean
  enableWorldPoints?: boolean
  imageTargets?: string[]
  enableVps?: boolean
  scale?: 'responsive' | 'absolute'
}

// -- Face Controller Configuration --

export interface FaceControllerConfig {
  meshGeometry?: FaceMeshGeometry[]
  maxDetections?: number
  coordinates?: {
    mirroredDisplay?: boolean
    axes?: 'RIGHT_HANDED' | 'LEFT_HANDED'
  }
}

export type FaceMeshGeometry = 'face' | 'eyes' | 'mouth' | 'iris'

export interface FaceControllerPipelineConfig {
  maxDetections?: number
  meshGeometry?: FaceMeshGeometry[]
}

// -- Enums / Constants --

export type XR8CameraDirection = 'front' | 'back'
export type XR8AllowedDevices = 'any' | 'mobile'

// -- XR8 Static Interface (window.XR8) --

export interface XR8Static {
  // Lifecycle
  run: (config: XR8RunConfig) => void
  stop: () => void
  pause: () => void
  resume: () => void

  // Own run loop methods
  runPreRender: (timestamp: number) => void
  runPostRender: (timestamp: number) => void

  // Pipeline module management
  addCameraPipelineModule: (module: XR8PipelineModule) => void
  addCameraPipelineModules: (modules: Array<XR8PipelineModule | null>) => void
  removeCameraPipelineModule: (name: string) => void
  removeCameraPipelineModules: (names: string[]) => void

  // Chunk loading
  loadChunk: (chunk: string) => Promise<void>

  // Recenter
  recenter: () => void

  // Sub-namespaces
  XrController: {
    configure: (config: XrControllerConfig) => void
    pipelineModule: () => XR8PipelineModule
    updateCameraProjectionMatrix: (params: {
      origin: { x: number; y: number; z: number }
      facing: { x: number; y: number; z: number; w: number }
    }) => void
    recenter: () => void
  }

  FaceController: {
    configure: (config: FaceControllerConfig) => void
    pipelineModule: (config?: FaceControllerPipelineConfig) => XR8PipelineModule
    MeshGeometry: {
      FACE: FaceMeshGeometry
      EYES: FaceMeshGeometry
      MOUTH: FaceMeshGeometry
      IRIS: FaceMeshGeometry
    }
  }

  GlTextureRenderer: {
    pipelineModule: () => XR8PipelineModule
  }

  LayersController?: {
    configure: (config: Record<string, unknown>) => void
    pipelineModule: () => XR8PipelineModule
  }

  XrConfig: {
    device: () => { ANY: XR8AllowedDevices; MOBILE: XR8AllowedDevices }
    camera: () => { FRONT: XR8CameraDirection; BACK: XR8CameraDirection }
  }

  // Threejs namespace (we avoid using this -- replaced by our bridge module)
  Threejs?: {
    pipelineModule: () => XR8PipelineModule
    xrScene: () => { scene: unknown; camera: unknown; renderer: unknown }
    configure: (config: Record<string, unknown>) => void
  }
}

// -- XRExtras Static Interface (window.XRExtras) --

export interface XRExtrasStatic {
  FullWindowCanvas: {
    pipelineModule: () => XR8PipelineModule
  }
  AlmostThere: {
    pipelineModule: () => XR8PipelineModule
  }
  Loading: {
    pipelineModule: () => XR8PipelineModule
    showLoading: (config: { onxrloaded: () => void }) => void
  }
  RuntimeError: {
    pipelineModule: () => XR8PipelineModule
  }
}

// -- Augment Window --

declare global {
  interface Window {
    XR8?: XR8Static
    XRExtras?: XRExtrasStatic
  }

  interface WindowEventMap {
    xrloaded: Event
  }
}
