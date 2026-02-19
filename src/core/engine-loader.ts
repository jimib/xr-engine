/**
 * On-demand loader for the 8th Wall XR8 engine binary.
 *
 * Loads the engine via script injection and returns a Promise that resolves
 * when XR8 is available on window. The engine stays in memory once loaded.
 * Calling loadEngine multiple times returns the same promise (idempotent).
 */

import type { XR8Static } from '../types/xr8'
import type { XREngineConfig } from '../types/config'

let loadPromise: Promise<XR8Static> | null = null
let loadFailed = false

function injectScript(url: string, attributes?: Record<string, string>): HTMLScriptElement {
  const script = document.createElement('script')
  script.src = url
  script.async = true
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      script.setAttribute(key, value)
    }
  }
  document.head.appendChild(script)
  return script
}

/**
 * Load the 8th Wall engine on demand.
 *
 * If `window.XR8` already exists (e.g. loaded via a `<script>` tag in HTML),
 * resolves immediately. Otherwise, injects the engine script and waits for
 * the `xrloaded` event.
 *
 * @param config Engine configuration including script URLs and preload chunks
 * @returns Promise resolving to the XR8 static interface
 */
export function loadEngine(config: XREngineConfig = {}): Promise<XR8Static> {
  // Already loaded
  if (window.XR8) {
    return Promise.resolve(window.XR8)
  }

  // Already loading (idempotent)
  if (loadPromise && !loadFailed) {
    return loadPromise
  }

  loadFailed = false

  loadPromise = new Promise<XR8Static>((resolve, reject) => {
    // Set up preload chunks hint for the engine (used by some 8th Wall builds)
    if (config.preloadChunks?.length) {
      (window as Record<string, unknown>)._XR8Chunks = config.preloadChunks
    }

    const onXRLoaded = async () => {
      window.removeEventListener('xrloaded', onXRLoaded)
      const xr8 = window.XR8
      if (!xr8) {
        loadFailed = true
        reject(new Error('xrloaded event fired but window.XR8 is not available'))
        return
      }

      // Load additional chunks if requested
      if (config.preloadChunks?.length) {
        try {
          await Promise.all(config.preloadChunks.map((chunk) => xr8.loadChunk(chunk)))
        } catch (err) {
          loadFailed = true
          reject(new Error(`Failed to load XR8 chunks: ${err}`))
          return
        }
      }

      resolve(xr8)
    }

    // Listen for the engine's ready event
    window.addEventListener('xrloaded', onXRLoaded)

    // Check again in case XR8 appeared between our initial check and event listener
    if (window.XR8) {
      window.removeEventListener('xrloaded', onXRLoaded)
      resolve(window.XR8)
      return
    }

    // Inject engine script if URL provided
    if (config.engineUrl) {
      const scriptAttrs: Record<string, string> = {}
      if (config.preloadChunks?.length) {
        scriptAttrs['data-preload-chunks'] = config.preloadChunks.join(',')
      }
      const script = injectScript(config.engineUrl, scriptAttrs)
      script.onerror = () => {
        window.removeEventListener('xrloaded', onXRLoaded)
        loadFailed = true
        reject(new Error(`Failed to load 8th Wall engine from: ${config.engineUrl}`))
      }
    }

    // Inject XRExtras script if URL provided
    if (config.extrasUrl) {
      const extrasScript = injectScript(config.extrasUrl)
      extrasScript.onerror = () => {
        console.warn(`Failed to load XRExtras from: ${config.extrasUrl}`)
      }
    }
  })

  return loadPromise
}

/** Returns the current XR8 instance if loaded, or null. */
export function getXR8(): XR8Static | null {
  return window.XR8 ?? null
}

/** Reset the loader state (useful for testing or retry after failure). */
export function resetLoader(): void {
  loadPromise = null
  loadFailed = false
}
