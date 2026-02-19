/**
 * Navigation -- HTML button bar for switching between experiences.
 *
 * Lives outside the Canvas in regular DOM. Updates lifted state in App.tsx
 * which triggers experience switches via ExperienceRouter.
 */

import type { ExperienceMode } from '../App'

interface NavigationProps {
  current: ExperienceMode
  onChange: (mode: ExperienceMode) => void
}

const navStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  gap: 8,
  padding: '16px',
  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  zIndex: 1000,
}

const buttonBase: React.CSSProperties = {
  padding: '12px 20px',
  border: '2px solid rgba(255,255,255,0.3)',
  borderRadius: 8,
  background: 'rgba(0,0,0,0.5)',
  color: 'white',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
}

const activeStyle: React.CSSProperties = {
  ...buttonBase,
  background: 'rgba(68, 136, 255, 0.8)',
  borderColor: 'rgba(68, 136, 255, 1)',
}

const modes: Array<{ mode: ExperienceMode; label: string }> = [
  { mode: 'slam', label: 'World AR' },
  { mode: 'face', label: 'Face AR' },
  { mode: 'non-xr', label: '3D Viewer' },
]

export function Navigation({ current, onChange }: NavigationProps) {
  return (
    <div style={navStyle}>
      {modes.map(({ mode, label }) => (
        <button
          key={mode}
          style={current === mode ? activeStyle : buttonBase}
          onClick={() => onChange(mode)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
