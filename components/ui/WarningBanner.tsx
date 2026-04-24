'use client'
import { Icon } from './Icon'

export function WarningBanner({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
      borderRadius: 12, background: 'var(--color-accent-bg)',
      border: '1.5px solid var(--color-accent-border)' }}>
      <Icon name="triangle-alert" size={16} style={{ color: 'var(--color-accent)', marginTop: 1, flexShrink: 0 }} />
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--color-accent-text)' }}>
        {message}
      </p>
    </div>
  )
}
