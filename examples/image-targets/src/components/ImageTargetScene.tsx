/**
 * ImageTargetScene -- Image target detection inside the Canvas.
 *
 * Configures XRProvider for image-target mode and subscribes to
 * image target events (imagefound / imageupdated / imagelost).
 *
 * Tracks detected targets in a Map keyed by target name so that
 * multiple targets can be tracked simultaneously.
 *
 * NOTE: Image targets must be registered in the 8th Wall console.
 * The names in the `imageTargets` array must match exactly.
 * See public/targets/README.md for details.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  XRProvider,
  XRRenderBridge,
  XRCameraBackground,
  useXREngine,
  useXRSession,
  useXREvent,
} from '@xr-engine/r3f-bridge'
import type { ImageTargetDetail } from '@xr-engine/r3f-bridge'
import { TargetContent } from './TargetContent'

const ENGINE_URL = import.meta.env.VITE_XR8_ENGINE_URL as string
const EXTRAS_URL = import.meta.env.VITE_XR8_EXTRAS_URL as string

const engineConfig = {
  engineUrl: ENGINE_URL || undefined,
  extrasUrl: EXTRAS_URL || undefined,
}

// Change this to match the target names registered in your 8th Wall console
const TARGET_NAMES = ['my-target']

interface ImageTargetSceneProps {
  onScanningChange?: (scanning: boolean) => void
}

export function ImageTargetScene({ onScanningChange }: ImageTargetSceneProps) {
  return (
    <XRProvider engineConfig={engineConfig} autoLoad>
      <XRRenderBridge />
      <XRCameraBackground />
      <ImageTargetContent onScanningChange={onScanningChange} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
    </XRProvider>
  )
}

/**
 * ImageTargetContent -- Manages image target session and events.
 *
 * Must be a child of XRProvider so that hooks have access to the XR context.
 */
function ImageTargetContent({ onScanningChange }: { onScanningChange?: (scanning: boolean) => void }) {
  const { isReady, status: engineStatus, error } = useXREngine()
  const { start, stop } = useXRSession()
  const [targets, setTargets] = useState<Map<string, ImageTargetDetail>>(new Map())
  const targetsRef = useRef(targets)
  targetsRef.current = targets

  // Start an image-target session when the engine is ready
  useEffect(() => {
    if (!isReady) return

    start({
      mode: 'image-target',
      cameraDirection: 'back',
      imageTargets: TARGET_NAMES,
    })

    return () => {
      stop()
    }
  }, [isReady, start, stop])

  // Log status for debugging
  useEffect(() => {
    if (error) {
      console.error('[ImageTargetContent] Engine error:', error.message)
    } else {
      console.log('[ImageTargetContent] Engine status:', engineStatus)
    }
  }, [engineStatus, error])

  // Notify parent when scanning state changes
  const updateScanning = useCallback(
    (newTargets: Map<string, ImageTargetDetail>) => {
      onScanningChange?.(newTargets.size === 0)
    },
    [onScanningChange],
  )

  // Image target found
  useXREvent('reality.imagefound', (detail: ImageTargetDetail) => {
    console.log('[ImageTargetContent] Target found:', detail.name)
    const next = new Map(targetsRef.current)
    next.set(detail.name, detail)
    setTargets(next)
    updateScanning(next)
  })

  // Image target updated (every frame while visible)
  useXREvent('reality.imageupdated', (detail: ImageTargetDetail) => {
    const next = new Map(targetsRef.current)
    next.set(detail.name, detail)
    setTargets(next)
  })

  // Image target lost
  useXREvent('reality.imagelost', (detail: ImageTargetDetail) => {
    console.log('[ImageTargetContent] Target lost:', detail.name)
    const next = new Map(targetsRef.current)
    next.delete(detail.name)
    setTargets(next)
    updateScanning(next)
  })

  return (
    <>
      {Array.from(targets.values()).map((target) => (
        <TargetContent key={target.name} target={target} />
      ))}
    </>
  )
}
