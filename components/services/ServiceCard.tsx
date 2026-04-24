'use client'
import { Icon } from '@/components/ui/Icon'
import { OpenStatus } from '@/components/ui/OpenStatus'
import { CATEGORY_CONFIG } from '@/lib/categories'
import type { ServiceDTO } from '@/lib/types'

interface Props {
  service: ServiceDTO
  onClick?: () => void
}

export function ServiceCard({ service, onClick }: Props) {
  const cat = CATEGORY_CONFIG[service.category]
  const distStr = service.distance != null
    ? service.distance < 1000
      ? `${Math.round(service.distance)} m`
      : `${(service.distance / 1000).toFixed(1)} km`
    : null

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
        cursor: 'pointer', textAlign: 'start', width: '100%',
        transition: 'box-shadow 0.15s ease', fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <span style={{
        width: 46, height: 46, borderRadius: 14, flexShrink: 0,
        background: `color-mix(in oklch, ${cat.cssVar} 15%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={cat.icon} size={22} style={{ color: cat.cssVar }} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 3,
          lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {service.name}
        </div>
        <OpenStatus isOpen={service.isOpen} closesAt={service.closesAt} size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5,
          color: 'var(--color-text-secondary)', fontSize: 13 }}>
          <Icon name="map-pin" size={13} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {service.address}
          </span>
          {distStr && <span style={{ flexShrink: 0 }}>· <strong>{distStr}</strong></span>}
        </div>
      </div>

      <Icon name="chevron-right" size={18} style={{ color: 'var(--color-text-secondary)', flexShrink: 0, marginTop: 2 }} />
    </button>
  )
}
