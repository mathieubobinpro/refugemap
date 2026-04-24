'use client'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import { OpenStatus } from '@/components/ui/OpenStatus'
import { WarningBanner } from '@/components/ui/WarningBanner'
import { ActionBtn } from '@/components/ui/ActionBtn'
import { LangFlag } from '@/components/ui/LangFlag'
import { CATEGORY_CONFIG } from '@/lib/categories'
import type { ServiceDTO } from '@/lib/types'

interface Props {
  service: ServiceDTO
}

export function DetailScreen({ service }: Props) {
  const t = useTranslations('detail')
  const router = useRouter()
  const cat = CATEGORY_CONFIG[service.category]

  const distStr = service.distance != null
    ? service.distance < 1000
      ? `${Math.round(service.distance)} m`
      : `${(service.distance / 1000).toFixed(1)} km`
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Hero */}
        <div style={{ padding: '16px 16px 20px', background: 'var(--color-surface)', borderBottom: '1.5px solid var(--color-border)' }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 0', background: 'none', border: 'none',
              color: 'var(--color-primary)', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, fontFamily: 'inherit', marginBottom: 16,
            }}
          >
            <Icon name="arrow-left" size={18} style={{ color: 'var(--color-primary)' }} />
            {t('back')}
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18, flexShrink: 0,
              background: `color-mix(in oklch, ${cat.cssVar} 15%, transparent)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={cat.icon} size={28} style={{ color: cat.cssVar }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: cat.cssVar, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                {cat.key}
              </div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.25 }}>
                {service.name}
              </h1>
              <div style={{ marginTop: 8 }}>
                <OpenStatus isOpen={service.isOpen} closesAt={service.closesAt} />
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div style={{ padding: '12px 16px 0' }}>
          <WarningBanner message={t('warning')} />
        </div>

        {/* Info sections */}
        <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 6 }}>

          <InfoRow icon="map-pin">
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{service.address}</div>
            {distStr && (
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                {distStr} {t('fromYou')}
              </div>
            )}
          </InfoRow>

          {service.hours && service.hours.length > 0 && (
            <>
              <Divider />
              <InfoRow icon="clock">
                {service.hours.map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 14, lineHeight: 1.8, color: 'var(--color-text)',
                  }}>
                    <span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>{h.day}</span>
                    <span style={{ fontWeight: 600 }}>{h.time}</span>
                  </div>
                ))}
              </InfoRow>
            </>
          )}

          {service.phone && (
            <>
              <Divider />
              <InfoRow icon="phone">
                <a href={`tel:${service.phone}`} style={{
                  fontSize: 15, fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none',
                }}>
                  {service.phone}
                </a>
              </InfoRow>
            </>
          )}

          {service.languages && service.languages.length > 0 && (
            <>
              <Divider />
              <InfoRow icon="languages">
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  {t('languagesSpoken')}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {service.languages.map((code) => <LangFlag key={code} code={code} />)}
                </div>
              </InfoRow>
            </>
          )}

          {service.description && (
            <>
              <Divider />
              <InfoRow icon="info">
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--color-text)' }}>
                  {service.description}
                </p>
              </InfoRow>
            </>
          )}

          {service.lastUpdated && (
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              {t('lastUpdated', { date: new Date(service.lastUpdated).toLocaleDateString() })}
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'sticky', bottom: 0,
        padding: '12px 16px 20px',
        background: 'var(--color-surface)', borderTop: '1.5px solid var(--color-border)',
        display: 'flex', gap: 10,
      }}>
        {service.phone && (
          <ActionBtn icon="phone" label={t('call')} href={`tel:${service.phone}`} />
        )}
        <ActionBtn
          icon="navigation"
          label={t('directions')}
          primary
          href={`https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`}
        />
        <button
          onClick={() => navigator.share?.({ title: service.name, url: window.location.href })}
          style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: 'var(--color-surface)', border: '1.5px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <Icon name="share-2" size={20} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>
    </div>
  )
}

function InfoRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 14, padding: '10px 0', alignItems: 'flex-start' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={18} style={{ color: 'var(--color-primary)' }} />
      </div>
      <div style={{ flex: 1, paddingTop: 6 }}>{children}</div>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--color-border)', margin: '2px 0' }} />
}
