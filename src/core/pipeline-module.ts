/**
 * Custom R3F bridge pipeline module that replaces XR8.Threejs.pipelineModule().
 *
 * Unlike the standard module, this does NOT create its own Three.js renderer,
 * scene, or camera. Instead it receives references to R3F's existing objects
 * and writes 8th Wall tracking data (camera intrinsics, position, rotation)
 * directly into R3F's camera.
 *
 * With `ownRunLoop: true`, `onRender` is never called. R3F handles rendering
 * via `useFrame` in XRRenderBridge.
 */

import type { PerspectiveCamera, WebGLRenderer } from 'three'
import type { XR8PipelineModule, PipelineStartArgs, PipelineUpdateArgs, PipelineCanvasSizeChangeArgs } from '../types/xr8'

export interface R3FBridgeConfig {
  /** R3F's WebGLRenderer (from useThree().gl) */
  getRenderer: () => WebGLRenderer
  /** R3F's camera (from useThree().camera) */
  getCamera: () => PerspectiveCamera
}

/**
 * Creates the R3F bridge pipeline module.
 *
 * This module bridges 8th Wall's tracking pipeline into R3F's camera.
 * It receives pose data from XR8's `onUpdate` and applies it to R3F's
 * PerspectiveCamera:
 *   - `intrinsics` → camera.projectionMatrix (16-element column-major 4x4)
 *   - `rotation` → camera.quaternion
 *   - `position` → camera.position
 *
 * The getters (getRenderer, getCamera) are used instead of direct references
 * to handle R3F's internal state updates (camera can change on resize, etc).
 */
export function createR3FBridgePipelineModule(
  config: R3FBridgeConfig,
): XR8PipelineModule {
  let engaged = false

  return {
    name: 'r3f-bridge',

    onStart(args: PipelineStartArgs) {
      engage(args)
    },

    onAttach(args) {
      engage(args as PipelineStartArgs)
    },

    onDetach() {
      engaged = false
    },

    onUpdate(args: PipelineUpdateArgs) {
      if (!engaged) return

      const { processCpuResult } = args
      // Extract tracking source - SLAM, face, hand, or layers
      const source =
        processCpuResult.reality ??
        processCpuResult.facecontroller ??
        processCpuResult.handcontroller ??
        processCpuResult.layerscontroller

      if (!source) return

      const camera = config.getCamera()
      const typedSource = source as {
        intrinsics?: number[] | Float32Array
        rotation?: { x: number; y: number; z: number; w: number }
        position?: { x: number; y: number; z: number }
      }

      // Apply camera intrinsics (projection matrix from device)
      if (typedSource.intrinsics) {
        for (let i = 0; i < 16; i++) {
          camera.projectionMatrix.elements[i] = typedSource.intrinsics[i]
        }
        // Update inverse for raycasting (required in Three.js r103+)
        camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
      }

      // Apply camera rotation from tracking
      if (typedSource.rotation) {
        camera.quaternion.set(
          typedSource.rotation.x,
          typedSource.rotation.y,
          typedSource.rotation.z,
          typedSource.rotation.w,
        )
      }

      // Apply camera position from tracking
      if (typedSource.position) {
        camera.position.set(
          typedSource.position.x,
          typedSource.position.y,
          typedSource.position.z,
        )
      }
    },

    onCanvasSizeChange(args: PipelineCanvasSizeChangeArgs) {
      if (!engaged) return
      const renderer = config.getRenderer()
      renderer.setSize(args.canvasWidth, args.canvasHeight, false)
    },

    // Note: onRender is intentionally NOT implemented.
    // With ownRunLoop: true, R3F handles rendering via useFrame in XRRenderBridge.
  }

  function engage(args: PipelineStartArgs) {
    if (engaged) return

    const renderer = config.getRenderer()
    const r3fContext = renderer.getContext()

    // Verify that 8th Wall and R3F share the same WebGL context
    if (r3fContext !== args.GLctx) {
      console.warn(
        '[r3f-bridge] WebGL context mismatch! 8th Wall and R3F are not sharing ' +
        'the same canvas. The bridge may not work correctly.',
      )
    }

    // Sync renderer size with 8th Wall's reported canvas size
    renderer.setSize(args.canvasWidth, args.canvasHeight, false)

    engaged = true
  }
}
