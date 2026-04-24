'use client'
import { useState } from 'react'
import { MapScreen } from '@/components/map/MapScreen'
import { LanguageScreen } from '@/components/LanguageScreen'
import { use } from 'react'

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const [showLang, setShowLang] = useState(false)

  return (
    <>
      <MapScreen locale={locale} onOpenLanguage={() => setShowLang(true)} />
      {showLang && (
        <LanguageScreen currentLocale={locale} onClose={() => setShowLang(false)} />
      )}
    </>
  )
}
