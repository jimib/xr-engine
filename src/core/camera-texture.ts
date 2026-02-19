/**
 * Camera feed texture pipeline module.
 *
 * Captures the native camera texture from 8th Wall's pipeline and binds it
 * to a Three.js Texture without copying pixel data. This technique uses
 * Three.js's internal property system to point a Texture at the native
 * WebGL texture that GlTextureRenderer has already uploaded to the GPU.
 *
 * The resulting `cameraFeedTexture` can be used as a material map on
 * XRCameraBackground to display the camera feed as a fullscreen background.
 */

import { Texture, LinearFilter, RGBAFormat } from 'three'
import type { WebGLRenderer } from 'three'
import type { XR8PipelineModule, PipelineProcessCpuArgs } from '../types/xr8'

export interface CameraTextureConfig {
  /** R3F's WebGLRenderer (needed to access renderer.properties) */
  getRenderer: () => WebGLRenderer
}

export interface CameraTextureResult {
  /** The pipeline module to install in XR8's pipeline */
  module: XR8PipelineModule
  /** Three.js texture that receives the camera feed each frame */
  cameraFeedTexture: Texture
  /** Whether the camera texture has been initialized with a valid frame */
  isReady: () => boolean
}

/**
 * Creates a pipeline module that captures the camera feed texture.
 *
 * The module runs during `onProcessCpu` to read `frameStartResult.cameraTexture`
 * (the native WebGLTexture that GlTextureRenderer uploaded during onProcessGpu)
 * and binds it to a Three.js Texture via the renderer's internal properties.
 *
 * This avoids any pixel copying - the Three.js texture directly references
 * the same GPU texture that 8th Wall uploaded.
 */
export function createCameraTexturePipelineModule(
  config: CameraTextureConfig,
): CameraTextureResult {
  // Create a Three.js texture for the camera feed
  const cameraFeedTexture = new Texture()
  cameraFeedTexture.minFilter = LinearFilter
  cameraFeedTexture.magFilter = LinearFilter
  cameraFeedTexture.format = RGBAFormat
  cameraFeedTexture.generateMipmaps = false

  let ready = false
  let textureWidth = 0
  let textureHeight = 0

  const module: XR8PipelineModule = {
    name: 'r3f-camera-texture',

    onProcessCpu(args: PipelineProcessCpuArgs) {
      const { frameStartResult } = args
      if (!frameStartResult.cameraTexture) return

      textureWidth = frameStartResult.textureWidth
      textureHeight = frameStartResult.textureHeight

      const renderer = config.getRenderer()

      // Access Three.js's internal property system to bind the native texture
      // This avoids copying pixel data - we point directly at the GPU texture
      // that GlTextureRenderer already uploaded
      const props = renderer.properties.get(cameraFeedTexture) as Record<string, unknown>
      props.__webglTexture = frameStartResult.cameraTexture
      props.__webglInit = true // Prevent Three.js from trying to re-upload

      if (!ready) {
        // Update texture dimensions on first frame
        cameraFeedTexture.image = { width: textureWidth, height: textureHeight }
        ready = true
      }
    },

    onDetach() {
      ready = false
    },
  }

  return {
    module,
    cameraFeedTexture,
    isReady: () => ready,
  }
}
