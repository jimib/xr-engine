/**
 * useXRStore - Generic store selector hook for XR session state.
 *
 * Provides reactive access to session manager state with selector support.
 * Uses useSyncExternalStore for React 18+ compatibility.
 *
 * Usage:
 *   const status = useXRStore(s => s.status)
 *   const mode = useXRStore(s => s.mode)
 */

import { useSyncExternalStore, useCallback } from 'react'
import { useXRContext } from '../XRProvider'
import type { SessionManagerState } from '../../core/session-manager'

/**
 * Subscribe to a slice of the XR session state.
 *
 * @param selector Function that picks the desired value from the session state
 * @returns The selected value, reactively updated when it changes
 */
export function useXRStore<T>(
  selector: (state: SessionManagerState) => T,
): T {
  const { sessionManager } = useXRContext()

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return sessionManager.subscribe(() => onStoreChange())
    },
    [sessionManager],
  )

  const getSnapshot = useCallback(
    () => selector(sessionManager.getState()),
    [sessionManager, selector],
  )

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
