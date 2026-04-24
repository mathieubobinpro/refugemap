'use client'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import { ALL_CATEGORIES } from '@/lib/categories'
import type { Category } from '@/lib/types'

interface Props {
  active: Category | null
  onChange: (cat: Category | null) => void
}

export function FilterBar({ active, onChange }: Props) {
  const t = useTranslations('categories')

  return (
    <div style={{ overflowX: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px' }}>
      <button
        onClick={() => onChange(null)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
          padding: '8px 14px', borderRadius: 'var(--radius-full)',
          border: active === null ? 'none' : '1.5px solid var(--color-border)',
          background: active === null ? 'var(--color-primary)' : 'var(--color-surface)',
          color: active === null ? '#fff' : 'var(--color-text)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
        }}
      >
        <Icon name="layers" size={16} style={{ color: active === null ? '#fff' : 'var(--color-primary)' }} />
        {t('all')}
      </button>

      {ALL_CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(active === cat.key ? null : cat.key)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '8px 14px', borderRadius: 'var(--radius-full)',
            border: active === cat.key ? 'none' : '1.5px solid var(--color-border)',
            background: active === cat.key ? cat.cssVar : 'var(--color-surface)',
            color: active === cat.key ? '#fff' : 'var(--color-text)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <Icon name={cat.icon} size={16} style={{ color: active === cat.key ? '#fff' : cat.cssVar }} />
          {t(cat.key)}
        </button>
      ))}
    </div>
  )
}
