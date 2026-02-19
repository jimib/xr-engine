/**
 * useXREvent - Hook for subscribing to typed XR events.
 *
 * Subscribes to events from the XR event bus (image targets, face tracking,
 * session lifecycle, camera permissions). Automatically unsubscribes on
 * unmount or when dependencies change.
 *
 * Usage:
 *   useXREvent('reality.imagefound', (detail) => {
 *     console.log('Image found:', detail.name, detail.position)
 *   })
 *
 *   useXREvent('face.facefound', (detail) => {
 *     console.log('Face found:', detail.id)
 *   })
 */

import { useEffect, useRef } from 'react'
import type { XREventMap } from '../../types/events'
import { useXRContext } from '../XRProvider'

type EventHandler<T> = (detail: T) => void

/**
 * Subscribe to a typed XR event.
 *
 * The handler is called on each event emission. Uses a ref internally
 * so the handler can be updated without re-subscribing.
 *
 * @param event The event name from XREventMap
 * @param handler Callback invoked with the event detail
 * @param deps Optional dependency array to control re-subscription
 */
export function useXREvent<K extends keyof XREventMap>(
  event: K,
  handler: EventHandler<XREventMap[K]>,
  deps: React.DependencyList = [],
): void {
  const { eventEmitter } = useXRContext()
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const unsubscribe = eventEmitter.on(event, (detail: XREventMap[K]) => {
      handlerRef.current(detail)
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, eventEmitter, ...deps])
}
