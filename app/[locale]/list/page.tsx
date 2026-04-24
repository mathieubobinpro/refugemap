import { ListScreen } from '@/components/services/ListScreen'

export default async function ListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <ListScreen locale={locale} />
}
