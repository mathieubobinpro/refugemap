'use client'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageScreen } from '@/components/LanguageScreen'

export default function LanguagePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const router = useRouter()
  return <LanguageScreen currentLocale={locale} onClose={() => router.back()} />
}
