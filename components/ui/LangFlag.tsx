'use client'

const LANG_META: Record<string, { flag: string; name: string }> = {
  fr: { flag: '🇫🇷', name: 'FR' }, en: { flag: '🇬🇧', name: 'EN' },
  ar: { flag: '🇸🇦', name: 'AR' }, ps: { flag: '🇦🇫', name: 'PS' },
  fa: { flag: '🇮🇷', name: 'FA' }, ti: { flag: '🇪🇷', name: 'TI' },
  so: { flag: '🇸🇴', name: 'SO' }, uk: { flag: '🇺🇦', name: 'UK' },
  ru: { flag: '🇷🇺', name: 'RU' }, hy: { flag: '🇦🇲', name: 'HY' },
  tr: { flag: '🇹🇷', name: 'TR' }, ku: { flag: '🏳️', name: 'KU' },
  es: { flag: '🇪🇸', name: 'ES' },
}

export function LangFlag({ code }: { code: string }) {
  const meta = LANG_META[code]
  if (!meta) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
      borderRadius: 999, background: 'var(--color-bg)', border: '1px solid var(--color-border)',
      fontSize: 12, color: 'var(--color-text-secondary)' }}>
      {meta.flag} {meta.name}
    </span>
  )
}
