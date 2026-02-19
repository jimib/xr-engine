/**
 * ExperienceRouter -- Conditional render for clean unmount/remount.
 *
 * Uses `key={current}` on the container to force React to completely
 * unmount the previous experience and mount the new one. This ensures
 * that useEffect cleanup runs (stopping the XR session, releasing the
 * camera) before the new experience starts.
 *
 * This is critical: without the key-based remount, React might try to
 * reconcile the old and new trees, leaving stale event subscriptions
 * or sessions running.
 */

import type { ExperienceMode } from '../App'
import { SlamExperience } from './SlamExperience'
import { FaceExperience } from './FaceExperience'
import { NonXRExperience } from './NonXRExperience'

interface ExperienceRouterProps {
  current: ExperienceMode
}

export function ExperienceRouter({ current }: ExperienceRouterProps) {
  // The key forces a full unmount/remount when switching experiences
  return (
    <group key={current}>
      {current === 'slam' && <SlamExperience />}
      {current === 'face' && <FaceExperience />}
      {current === 'non-xr' && <NonXRExperience />}
    </group>
  )
}
