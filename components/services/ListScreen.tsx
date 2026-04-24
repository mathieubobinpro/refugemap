'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import { FilterBar } from './FilterBar'
import { ServiceCard } from './ServiceCard'
import { useAppStore } from '@/lib/store'
import type { Category, ServiceDTO } from '@/lib/types'

interface Props {
  locale: string
}

export function ListScreen({ locale }: Props) {
  const t = useTranslations('list')
  const router = useRouter()
  const { position, activeCategory, setActiveCategory, cacheServices } = useAppStore()
  const [services, setServices] = useState<ServiceDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams({
      lat: String(position.lat),
      lng: String(position.lng),
      radius: '10000',
    })
    if (activeCategory) params.set('category', activeCategory)

    setLoading(true)
    fetch(`/api/services?${params}`)
      .then((r) => r.json())
      .then((data: ServiceDTO[]) => {
        setServices(data)
        cacheServices(data)
      })
      .finally(() => setLoading(false))
  }, [position, activeCategory, cacheServices])

  const filtered = activeCategory ? services.filter((s) => s.category === activeCategory) : services

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 0', background: 'var(--color-surface)',
        borderBottom: '1.5px solid var(--color-border)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'var(--color-bg)', border: '1.5px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Icon name="arrow-left" size={20} style={{ color: 'var(--color-text)' }} />
          </button>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text)', flex: 1 }}>
            {t('title')}
          </h1>
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: 'var(--color-primary-light)', color: 'var(--color-primary)',
            fontSize: 13, fontWeight: 700,
          }}>
            {filtered.length}
          </span>
        </div>
        <div style={{ marginLeft: -16, marginRight: -16, paddingBottom: 14 }}>
          <FilterBar active={activeCategory} onChange={(c) => setActiveCategory(c as Category | null)} />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Icon name="loader" size={28} style={{ color: 'var(--color-text-secondary)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onReset={() => setActiveCategory(null)} />
        ) : (
          filtered.map((svc) => (
            <ServiceCard
              key={svc.id}
              service={svc}
              onClick={() => router.push(`/${locale}/service/${svc.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  const t = useTranslations('list')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 24, marginBottom: 20,
        background: 'var(--color-bg)', border: '2px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="search-x" size={32} style={{ color: 'var(--color-text-secondary)' }} />
      </div>
      <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
        {t('empty')}
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
        {t('emptyDetail')}
      </p>
      <button
        onClick={onReset}
        style={{
          padding: '12px 24px', borderRadius: 12, background: 'var(--color-primary)',
          border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        {t('showAll')}
      </button>
    </div>
  )
}
