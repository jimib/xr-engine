/**
 * Strongly-typed event emitter for XR events.
 *
 * Pipeline modules emit events into this bus, and React hooks subscribe to
 * specific event types. Uses a simple pub/sub pattern without DOM dependencies.
 */

import type { XREventMap } from '../types/events'
import type { XR8PipelineModule } from '../types/xr8'

type EventHandler<T> = (detail: T) => void

export class XREventEmitter {
  private listeners = new Map<string, Set<EventHandler<unknown>>>()

  /** Subscribe to a typed XR event. Returns an unsubscribe function. */
  on<K extends keyof XREventMap>(
    event: K,
    handler: EventHandler<XREventMap[K]>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    const handlers = this.listeners.get(event)!
    handlers.add(handler as EventHandler<unknown>)

    return () => {
      handlers.delete(handler as EventHandler<unknown>)
      if (handlers.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /** Emit an event to all subscribers. */
  emit<K extends keyof XREventMap>(event: K, detail: XREventMap[K]): void {
    const handlers = this.listeners.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      handler(detail)
    }
  }

  /** Remove all listeners. */
  removeAll(): void {
    this.listeners.clear()
  }
}

/**
 * Creates a pipeline module that bridges 8th Wall's listener-based events
 * into our typed event emitter.
 *
 * 8th Wall pipeline modules use a `listeners` array with `{ event, process }`
 * entries. This module converts those into emissions on our event bus.
 */
export function createEventBridgePipelineModule(
  emitter: XREventEmitter,
): XR8PipelineModule {
  return {
    name: 'r3f-event-bridge',
    listeners: [
      // Image target events
      {
        event: 'reality.imageloading',
        process: (detail: unknown) =>
          emitter.emit('reality.imageloading', detail as XREventMap['reality.imageloading']),
      },
      {
        event: 'reality.imagescanning',
        process: (detail: unknown) =>
          emitter.emit('reality.imagescanning', detail as XREventMap['reality.imagescanning']),
      },
      {
        event: 'reality.imagefound',
        process: (detail: unknown) =>
          emitter.emit('reality.imagefound', detail as XREventMap['reality.imagefound']),
      },
      {
        event: 'reality.imageupdated',
        process: (detail: unknown) =>
          emitter.emit('reality.imageupdated', detail as XREventMap['reality.imageupdated']),
      },
      {
        event: 'reality.imagelost',
        process: (detail: unknown) =>
          emitter.emit('reality.imagelost', detail as XREventMap['reality.imagelost']),
      },

      // Face tracking events
      {
        event: 'facecontroller.faceloading',
        process: (detail: unknown) =>
          emitter.emit('face.faceloading', detail as XREventMap['face.faceloading']),
      },
      {
        event: 'facecontroller.facescanning',
        process: (detail: unknown) =>
          emitter.emit('face.facescanning', detail as XREventMap['face.facescanning']),
      },
      {
        event: 'facecontroller.facefound',
        process: (detail: unknown) =>
          emitter.emit('face.facefound', detail as XREventMap['face.facefound']),
      },
      {
        event: 'facecontroller.faceupdated',
        process: (detail: unknown) =>
          emitter.emit('face.faceupdated', detail as XREventMap['face.faceupdated']),
      },
      {
        event: 'facecontroller.facelost',
        process: (detail: unknown) =>
          emitter.emit('face.facelost', detail as XREventMap['face.facelost']),
      },
      {
        event: 'facecontroller.mouthopened',
        process: (detail: unknown) =>
          emitter.emit('face.mouthopened', detail as XREventMap['face.mouthopened']),
      },
    ],
  }
}

/**
 * Creates a pipeline module that monitors camera permission status
 * and emits events through the event bus.
 */
export function createCameraStatusPipelineModule(
  emitter: XREventEmitter,
): XR8PipelineModule {
  return {
    name: 'r3f-camera-status',
    onCameraStatusChange({ status }) {
      if (status === 'failed') {
        emitter.emit('camera.permissionDenied', undefined)
      } else if (status === 'hasVideo') {
        emitter.emit('camera.permissionGranted', undefined)
      }
    },
  }
}
