/**
 * XRProvider - React context provider for the XR bridge.
 *
 * Must be placed inside R3F's <Canvas> component. Creates all core singletons
 * (event emitter, pipeline modules, session manager) once on mount and provides
 * them to descendants via React context.
 *
 * Usage:
 *   <Canvas>
 *     <XRProvider engineConfig={{ engineUrl: '/xr8.js' }}>
 *       <XRRenderBridge />
 *       <XRCameraBackground />
 *       <YourScene />
 *     </XRProvider>
 *   </Canvas>
 */

import {
  createContext,
  useContext,
  useRef,
  useEffect,
  type ReactNode,
} from 'react'
import { useThree } from '@react-three/fiber'
import type { PerspectiveCamera, Texture, WebGLRenderer } from 'three'

import type { XREngineConfig, XRSessionConfig, XRSessionStatus } from '../types/config'
import { XREventEmitter, createEventBridgePipelineModule, createCameraStatusPipelineModule } from '../core/event-emitter'
import { createR3FBridgePipelineModule } from '../core/pipeline-module'
import { createCameraTexturePipelineModule } from '../core/camera-texture'
import { createSessionManager, type SessionManager, type SessionManagerState } from '../core/session-manager'
import { loadEngine } from '../core/engine-loader'

// -- Context Value --

export interface XRContextValue {
  eventEmitter: XREventEmitter
  sessionManager: SessionManager
  cameraFeedTexture: Texture
  /** Direct access to the canvas for session start */
  getCanvas: () => HTMLCanvasElement
}

const XRContext = createContext<XRContextValue | null>(null)

// -- Provider Props --

export interface XRProviderProps {
  /** Configuration for engine loading (script URLs, preload chunks) */
  engineConfig?: XREngineConfig
  /** Auto-load the engine on mount. Defaults to true if engineConfig is provided. */
  autoLoad?: boolean
  children: ReactNode
}

// -- Provider Component --

export function XRProvider({ engineConfig, autoLoad, children }: XRProviderProps) {
  const { gl, camera } = useThree()
  const contextRef = useRef<XRContextValue | null>(null)

  // Create all singletons once on first render
  if (!contextRef.current) {
    const eventEmitter = new XREventEmitter()

    // Create getter functions so pipeline modules always access current R3F state
    const getRenderer = () => gl as WebGLRenderer
    const getCamera = () => camera as PerspectiveCamera

    // Core pipeline modules
    const bridgeModule = createR3FBridgePipelineModule({
      getRenderer,
      getCamera,
    })

    const { module: cameraTextureModule, cameraFeedTexture } =
      createCameraTexturePipelineModule({ getRenderer })

    const eventBridgeModule = createEventBridgePipelineModule(eventEmitter)
    const cameraStatusModule = createCameraStatusPipelineModule(eventEmitter)

    // Session manager with all core modules
    const sessionManager = createSessionManager({
      eventEmitter,
      corePipelineModules: [
        bridgeModule,
        cameraTextureModule,
        eventBridgeModule,
        cameraStatusModule,
      ],
      engineConfig,
    })

    contextRef.current = {
      eventEmitter,
      sessionManager,
      cameraFeedTexture,
      getCanvas: () => gl.domElement,
    }
  }

  // Auto-load engine if configured
  useEffect(() => {
    if (engineConfig && (autoLoad ?? true)) {
      loadEngine(engineConfig).then(
        () => contextRef.current?.eventEmitter.emit('engine.loaded', undefined),
        (err) =>
          contextRef.current?.eventEmitter.emit('engine.error', {
            error: err instanceof Error ? err : new Error(String(err)),
            code: 'ENGINE_LOAD_FAILED',
          }),
      )
    }
  }, [engineConfig, autoLoad])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      contextRef.current?.sessionManager.stop()
      contextRef.current?.eventEmitter.removeAll()
    }
  }, [])

  return (
    <XRContext.Provider value={contextRef.current}>
      {children}
    </XRContext.Provider>
  )
}

// -- Context Hook --

export function useXRContext(): XRContextValue {
  const ctx = useContext(XRContext)
  if (!ctx) {
    throw new Error(
      'useXRContext must be used within <XRProvider>. ' +
      'Make sure <XRProvider> is inside <Canvas>.',
    )
  }
  return ctx
}
