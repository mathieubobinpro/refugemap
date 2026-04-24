'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { Icon } from '@/components/ui/Icon'
import { FilterBar } from '@/components/services/FilterBar'
import { ServiceCard } from '@/components/services/ServiceCard'
import { ActionBtn } from '@/components/ui/ActionBtn'
import { useAppStore } from '@/lib/store'
import type { Category, ServiceDTO } from '@/lib/types'
import { DEFAULT_POSITION } from '@/lib/types'

const MapView = dynamic(() => import('./MapView').then((m) => m.MapView), { ssr: false })

interface Props {
  locale: string
  onOpenLanguage: () => void
}

export function MapScreen({ locale, onOpenLanguage }: Props) {
  const t = useTranslations('map')
  const router = useRouter()
  const { position, positionGranted, setPosition, activeCategory, setActiveCategory, cacheServices } = useAppStore()
  const [services, setServices] = useState<ServiceDTO[]>([])
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null)
  const [geoReady, setGeoReady] = useState(false)

  // Géolocalisation au montage — on attend la réponse avant le premier fetch
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoReady(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }, true)
        setGeoReady(true)
      },
      () => {
        setPosition(DEFAULT_POSITION, false)
        setGeoReady(true)
      },
      { timeout: 8000, maximumAge: 60000 }
    )
  }, [setPosition])

  // Fetch services — seulement après que la géoloc soit résolue
  useEffect(() => {
    if (!geoReady) return
    const params = new URLSearchParams({
      lat: String(position.lat),
      lng: String(position.lng),
      radius: '5000',
    })
    if (activeCategory) params.set('category', activeCategory)

    fetch(`/api/services?${params}`)
      .then((r) => r.json())
      .then((data: ServiceDTO[]) => {
        setServices(data)
        cacheServices(data)
      })
      .catch(() => {})
  }, [geoReady, position, activeCategory, cacheServices])

  const filtered = activeCategory ? services.filter((s) => s.category === activeCategory) : services
  const activeService = activeServiceId ? services.find((s) => s.id === activeServiceId) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Top bar overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '12px 16px 0',
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none',
      }}>
        {/* Search row */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', pointerEvents: 'auto' }}>
          <button
            onClick={() => router.push(`/${locale}/list`)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--color-surface)', borderRadius: 14,
              padding: '10px 14px', boxShadow: 'var(--shadow-md)',
              border: '1.5px solid var(--color-border)', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Icon name="search" size={18} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
            <span style={{ fontSize: 15, color: 'var(--color-text-secondary)' }}>
              {t('searchPlaceholder')}
            </span>
          </button>
          <button
            onClick={onOpenLanguage}
            style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="languages" size={20} style={{ color: 'var(--color-primary)' }} />
          </button>
        </div>

        {/* Filter chips */}
        <div style={{
          background: 'linear-gradient(to bottom, var(--color-bg) 60%, transparent)',
          paddingBottom: 12, marginLeft: -16, marginRight: -16, paddingLeft: 0, paddingRight: 0,
          pointerEvents: 'auto',
        }}>
          <FilterBar active={activeCategory} onChange={(c) => setActiveCategory(c as Category | null)} />
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapView
          services={filtered}
          position={position}
          positionGranted={positionGranted}
          activeServiceId={activeServiceId}
          onSelectService={setActiveServiceId}
        />
      </div>

      {/* Bottom sheet */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
        {activeService ? (
          <div style={{
            background: 'var(--color-surface)', borderTopLeftRadius: 24, borderTopRightRadius: 24,
            boxShadow: '0 -4px 24px rgba(0,0,0,0.12)', padding: '16px 16px 20px',
            animation: 'slideUp 0.3s ease',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--color-border)', margin: '0 auto 16px' }} />
            <ServiceCard service={activeService} onClick={() => router.push(`/${locale}/service/${activeService.id}`)} />
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {activeService.phone && (
                <ActionBtn icon="phone" label={t('myLocation')} href={`tel:${activeService.phone}`} />
              )}
              <ActionBtn
                icon="navigation"
                label="Itinéraire"
                primary
                href={`https://www.google.com/maps/dir/?api=1&destination=${activeService.lat},${activeService.lng}`}
              />
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--color-surface)', borderTopLeftRadius: 24, borderTopRightRadius: 24,
            boxShadow: '0 -4px 24px rgba(0,0,0,0.12)', padding: '14px 16px 16px',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--color-border)', margin: '0 auto 12px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
                {t('servicesNearby', { count: filtered.length })}
              </span>
              <button
                onClick={() => router.push(`/${locale}/list`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 999,
                  background: 'var(--color-primary)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                }}
              >
                <Icon name="list" size={15} style={{ color: '#fff' }} />
                {t('viewList')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
