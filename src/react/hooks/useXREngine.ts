/**
 * useXREngine - Hook for loading and monitoring the 8th Wall engine.
 *
 * Provides engine loading status and a manual load trigger.
 * When used with <XRProvider autoLoad>, the engine loads automatically.
 * Otherwise, call `load()` to trigger loading.
 */

import { useState, useEffect, useCallback } from 'react'
import type { XREngineConfig, XREngineStatus } from '../../types/config'
import { loadEngine, getXR8 } from '../../core/engine-loader'
import { useXRContext } from '../XRProvider'

export interface UseXREngineResult {
  /** Current engine status */
  status: XREngineStatus
  /** Error if loading failed */
  error: Error | null
  /** Whether the engine is ready to create sessions */
  isReady: boolean
  /** Manually trigger engine loading */
  load: (config?: XREngineConfig) => Promise<void>
}

export function useXREngine(config?: XREngineConfig): UseXREngineResult {
  const { eventEmitter } = useXRContext()

  const [status, setStatus] = useState<XREngineStatus>(() =>
    getXR8() ? 'loaded' : 'idle',
  )
  const [error, setError] = useState<Error | null>(null)

  // Subscribe to engine lifecycle events
  useEffect(() => {
    const unsubLoaded = eventEmitter.on('engine.loaded', () => {
      setStatus('loaded')
      setError(null)
    })

    const unsubError = eventEmitter.on('engine.error', (detail) => {
      setStatus('error')
      setError(detail.error)
    })

    // Check if engine was loaded before this component mounted
    if (getXR8()) {
      setStatus('loaded')
    }

    return () => {
      unsubLoaded()
      unsubError()
    }
  }, [eventEmitter])

  const load = useCallback(
    async (overrideConfig?: XREngineConfig) => {
      if (status === 'loaded' || status === 'loading') return

      setStatus('loading')
      setError(null)

      try {
        await loadEngine(overrideConfig ?? config ?? {})
        setStatus('loaded')
        eventEmitter.emit('engine.loaded', undefined)
      } catch (err) {
        const loadError = err instanceof Error ? err : new Error(String(err))
        setStatus('error')
        setError(loadError)
        eventEmitter.emit('engine.error', {
          error: loadError,
          code: 'ENGINE_LOAD_FAILED',
        })
      }
    },
    [config, status, eventEmitter],
  )

  return {
    status,
    error,
    isReady: status === 'loaded',
    load,
  }
}
