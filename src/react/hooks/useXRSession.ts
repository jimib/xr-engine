/**
 * useXRSession - Hook for controlling XR session lifecycle.
 *
 * Provides methods to start, stop, pause, resume, and switch modes
 * for XR sessions, along with the current session status and mode.
 *
 * Usage:
 *   function MyScene() {
 *     const { start, stop, status, mode } = useXRSession()
 *
 *     useEffect(() => {
 *       start({ mode: 'slam', cameraDirection: 'back' })
 *       return () => { stop() }
 *     }, [])
 *
 *     return <mesh>...</mesh>
 *   }
 */

import { useState, useEffect, useCallback } from 'react'
import type { XRSessionConfig, XRSessionStatus, XRSessionMode } from '../../types/config'
import { useXRContext } from '../XRProvider'
import type { SessionManagerState } from '../../core/session-manager'

export interface UseXRSessionResult {
  /** Current session status */
  status: XRSessionStatus
  /** Current session mode (null if inactive) */
  mode: XRSessionMode | null
  /** Start an XR session with the given configuration */
  start: (config: XRSessionConfig) => Promise<void>
  /** Stop the current XR session */
  stop: () => Promise<void>
  /** Pause the session (releases camera, pauses tracking) */
  pause: () => void
  /** Resume a paused session */
  resume: () => void
  /** Switch to a different mode (stops and restarts) */
  switchMode: (config: XRSessionConfig) => Promise<void>
  /** Whether a session is currently active */
  isActive: boolean
  /** Whether a session is currently paused */
  isPaused: boolean
}

export function useXRSession(): UseXRSessionResult {
  const { sessionManager, getCanvas } = useXRContext()

  const [status, setStatus] = useState<XRSessionStatus>(
    sessionManager.getState().status,
  )
  const [mode, setMode] = useState<XRSessionMode | null>(
    sessionManager.getState().mode,
  )

  // Subscribe to session state changes
  useEffect(() => {
    const unsubscribe = sessionManager.subscribe((state: SessionManagerState) => {
      setStatus(state.status)
      setMode(state.mode)
    })
    return unsubscribe
  }, [sessionManager])

  const start = useCallback(
    async (config: XRSessionConfig) => {
      const canvas = getCanvas()
      await sessionManager.start(canvas, config)
    },
    [sessionManager, getCanvas],
  )

  const stop = useCallback(async () => {
    await sessionManager.stop()
  }, [sessionManager])

  const pause = useCallback(() => {
    sessionManager.pause()
  }, [sessionManager])

  const resume = useCallback(() => {
    sessionManager.resume()
  }, [sessionManager])

  const switchMode = useCallback(
    async (config: XRSessionConfig) => {
      const canvas = getCanvas()
      await sessionManager.switchMode(canvas, config)
    },
    [sessionManager, getCanvas],
  )

  return {
    status,
    mode,
    start,
    stop,
    pause,
    resume,
    switchMode,
    isActive: status === 'active',
    isPaused: status === 'paused',
  }
}
