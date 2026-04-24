'use client'
import { Icon } from '@/components/ui/Icon'
import { CATEGORY_CONFIG } from '@/lib/categories'
import type { Category } from '@/lib/types'

interface Props {
  category: Category
  size?: number
  active?: boolean
  onClick?: () => void
}

export function MapPin({ category, size = 32, active = false, onClick }: Props) {
  const cat = CATEGORY_CONFIG[category]
  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size + size * 0.3,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        filter: active
          ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        transform: active ? 'scale(1.2)' : 'scale(1)',
        transition: 'transform 0.2s ease, filter 0.2s ease',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: size, height: size,
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        background: cat.cssVar,
        border: '2.5px solid #fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ transform: 'rotate(45deg)' }}>
          <Icon name={cat.icon} size={size * 0.45} style={{ color: '#fff' }} />
        </div>
      </div>
      <div style={{ width: 2, height: size * 0.3, background: cat.cssVar, marginTop: -1 }} />
    </div>
  )
}
