'use client'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import { useAppStore } from '@/lib/store'

const LANGUAGES = [
  { code: 'fr', native: 'Français',    flag: '🇫🇷', name: 'Français' },
  { code: 'ar', native: 'العربية',      flag: '🇸🇦', name: 'Arabe' },
  { code: 'en', native: 'English',      flag: '🇬🇧', name: 'Anglais' },
  { code: 'uk', native: 'Українська',   flag: '🇺🇦', name: 'Ukrainien' },
  { code: 'ru', native: 'Русский',      flag: '🇷🇺', name: 'Russe' },
  { code: 'ps', native: 'پښتو',         flag: '🇦🇫', name: 'Pachto' },
  { code: 'fa', native: 'دری',           flag: '🇮🇷', name: 'Dari' },
  { code: 'ti', native: 'ትግርኛ',          flag: '🇪🇷', name: 'Tigrigna' },
  { code: 'es', native: 'Español',      flag: '🇪🇸', name: 'Espagnol' },
]

interface Props {
  currentLocale: string
  onClose: () => void
}

export function LanguageScreen({ currentLocale, onClose }: Props) {
  const t = useTranslations('language')
  const router = useRouter()
  const setLocale = useAppStore((s) => s.setLocale)

  function handleSelect(code: string) {
    setLocale(code)
    // Navigate to the same path with new locale prefix
    const path = window.location.pathname.replace(/^\/[a-z]{2}(\/|$)/, `/${code}$1`) || `/${code}`
    router.push(path)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px', background: 'var(--color-surface)',
        borderBottom: '1.5px solid var(--color-border)', flexShrink: 0,
        textAlign: 'center', position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', left: 16, top: 20,
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--color-bg)', border: '1.5px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <Icon name="x" size={20} style={{ color: 'var(--color-text)' }} />
        </button>

        <div style={{
          width: 48, height: 48, borderRadius: 16, margin: '0 auto 12px',
          background: 'var(--color-primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="languages" size={24} style={{ color: 'var(--color-primary)' }} />
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: 'var(--color-text)' }}>
          {t('title')}
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)' }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Grid */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: 16,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignContent: 'start',
      }}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
              background: currentLocale === lang.code ? 'var(--color-primary-light)' : 'var(--color-surface)',
              border: currentLocale === lang.code
                ? '2px solid var(--color-primary)'
                : '1.5px solid var(--color-border)',
              textAlign: 'start', transition: 'all 0.15s ease', fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 24, flexShrink: 0 }}>{lang.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>
                {lang.native}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                {lang.name}
              </div>
            </div>
            {currentLocale === lang.code && (
              <Icon name="check" size={18} style={{ color: 'var(--color-primary)' }} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
