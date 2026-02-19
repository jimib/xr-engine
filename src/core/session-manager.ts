/**
 * XR session lifecycle manager.
 *
 * Handles starting, stopping, pausing, resuming, and switching modes
 * for XR sessions. Manages the installation order of pipeline modules
 * and the constraints of the 8th Wall API (e.g. SLAM config cannot
 * change at runtime).
 */

import type { XR8PipelineModule, XR8Static } from '../types/xr8'
import type { XRSessionConfig, XRSessionStatus, XREngineConfig } from '../types/config'
import type { XREventEmitter } from './event-emitter'
import { loadEngine, getXR8 } from './engine-loader'

export interface SessionManagerConfig {
  /** Event emitter for session lifecycle events */
  eventEmitter: XREventEmitter
  /** Pipeline modules to install for every session (bridge, camera texture, events) */
  corePipelineModules: XR8PipelineModule[]
  /** Engine config for lazy loading */
  engineConfig?: XREngineConfig
}

export interface SessionManagerState {
  status: XRSessionStatus
  mode: XRSessionConfig['mode'] | null
  config: XRSessionConfig | null
}

export interface SessionManager {
  /** Get current session state */
  getState: () => SessionManagerState

  /** Subscribe to state changes. Returns unsubscribe function. */
  subscribe: (listener: (state: SessionManagerState) => void) => () => void

  /**
   * Start an XR session on the given canvas.
   * Loads the engine if not already loaded.
   * Configures tracking, installs pipeline modules, and calls XR8.run().
   */
  start: (canvas: HTMLCanvasElement, config: XRSessionConfig) => Promise<void>

  /** Stop the current session. Removes pipeline modules and calls XR8.stop(). */
  stop: () => Promise<void>

  /** Pause the session (releases camera, pauses tracking). */
  pause: () => void

  /** Resume a paused session (reopens camera, resumes tracking). */
  resume: () => void

  /**
   * Switch to a different XR mode.
   * Stops the current session, reconfigures, and starts a new one.
   * Required because SLAM config cannot change at runtime.
   */
  switchMode: (canvas: HTMLCanvasElement, config: XRSessionConfig) => Promise<void>
}

export function createSessionManager(
  managerConfig: SessionManagerConfig,
): SessionManager {
  const { eventEmitter, corePipelineModules, engineConfig } = managerConfig

  let state: SessionManagerState = {
    status: 'inactive',
    mode: null,
    config: null,
  }

  const listeners = new Set<(state: SessionManagerState) => void>()
  let installedModuleNames: string[] = []
  let currentCanvas: HTMLCanvasElement | null = null

  function setState(partial: Partial<SessionManagerState>) {
    state = { ...state, ...partial }
    for (const listener of listeners) {
      listener(state)
    }
  }

  async function ensureEngine(): Promise<XR8Static> {
    const existing = getXR8()
    if (existing) return existing
    return loadEngine(engineConfig)
  }

  function buildPipelineModules(
    xr8: XR8Static,
    config: XRSessionConfig,
  ): XR8PipelineModule[] {
    const modules: XR8PipelineModule[] = []

    // Camera feed texture upload (must be first)
    modules.push(xr8.GlTextureRenderer.pipelineModule())

    // Core bridge modules (r3f-bridge, r3f-camera-texture, r3f-event-bridge, r3f-camera-status)
    modules.push(...corePipelineModules)

    // Tracking controller (must come after core modules for correct lifecycle order)
    if (config.mode === 'face') {
      modules.push(
        xr8.FaceController.pipelineModule({
          maxDetections: config.maxFaceDetections ?? 1,
          meshGeometry: config.faceMeshGeometry,
        }),
      )
    } else {
      // SLAM or image-target mode
      modules.push(xr8.XrController.pipelineModule())
    }

    // Sky/layers controller if enabled
    if (config.enableSky && xr8.LayersController) {
      modules.push(xr8.LayersController.pipelineModule())
    }

    return modules
  }

  return {
    getState() {
      return state
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },

    async start(canvas, config) {
      if (state.status === 'active' || state.status === 'starting') {
        console.warn('[session-manager] Session already active or starting')
        return
      }

      setState({ status: 'starting', config })

      try {
        const xr8 = await ensureEngine()

        // Configure tracking controllers BEFORE adding pipeline modules
        if (config.mode === 'face') {
          xr8.FaceController.configure({
            maxDetections: config.maxFaceDetections ?? 1,
            coordinates: {
              mirroredDisplay: config.mirroredDisplay ?? (config.cameraDirection === 'front'),
              axes: 'RIGHT_HANDED',
            },
          })
        } else {
          // SLAM or image-target mode
          xr8.XrController.configure({
            disableWorldTracking: config.disableWorldTracking ?? false,
            enableLighting: config.enableLighting ?? false,
            enableWorldPoints: config.enableWorldPoints ?? false,
            imageTargets: config.imageTargets,
            scale: config.scale ?? 'responsive',
          })
        }

        // Build and install pipeline modules
        const modules = buildPipelineModules(xr8, config)
        installedModuleNames = modules.map((m) => m.name)

        for (const mod of modules) {
          xr8.addCameraPipelineModule(mod)
        }

        // Determine camera direction
        let cameraDirection: 'front' | 'back' = config.cameraDirection ?? 'back'
        if (config.mode === 'face' && !config.cameraDirection) {
          cameraDirection = 'front'
        }

        // Start XR8 with ownRunLoop (R3F drives the frame loop)
        xr8.run({
          canvas,
          ownRunLoop: true,
          webgl2: engineConfig?.webgl2 ?? false,
          cameraConfig: { direction: cameraDirection },
          glContextConfig: { alpha: true, preserveDrawingBuffer: false },
          allowedDevices: config.mode === 'face'
            ? (engineConfig?.allowedDevices ?? 'any')
            : engineConfig?.allowedDevices,
        })

        currentCanvas = canvas
        setState({ status: 'active', mode: config.mode })
        eventEmitter.emit('session.started', undefined)
      } catch (err) {
        setState({ status: 'inactive', mode: null, config: null })
        eventEmitter.emit('session.error', {
          error: err instanceof Error ? err : new Error(String(err)),
          code: 'SESSION_START_FAILED',
        })
        throw err
      }
    },

    async stop() {
      if (state.status === 'inactive') return

      setState({ status: 'stopping' })

      const xr8 = getXR8()
      if (xr8) {
        // Remove our installed modules
        if (installedModuleNames.length > 0) {
          try {
            xr8.removeCameraPipelineModules(installedModuleNames)
          } catch {
            // May fail if modules were already removed
          }
          installedModuleNames = []
        }

        try {
          xr8.stop()
        } catch {
          // May fail if not running
        }
      }

      currentCanvas = null
      setState({ status: 'inactive', mode: null, config: null })
      eventEmitter.emit('session.stopped', undefined)
    },

    pause() {
      if (state.status !== 'active') return
      const xr8 = getXR8()
      if (!xr8) return

      xr8.pause()
      setState({ status: 'paused' })
      eventEmitter.emit('session.paused', undefined)
    },

    resume() {
      if (state.status !== 'paused') return
      const xr8 = getXR8()
      if (!xr8) return

      xr8.resume()
      setState({ status: 'active' })
      eventEmitter.emit('session.resumed', undefined)
    },

    async switchMode(canvas, newConfig) {
      // Must fully stop and restart because SLAM config cannot change at runtime
      await this.stop()

      // Brief delay to let XR8 clean up
      await new Promise((r) => setTimeout(r, 100))

      await this.start(canvas, newConfig)
    },
  }
}
