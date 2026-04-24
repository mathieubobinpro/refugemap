'use client'

interface Props {
  isOpen?: boolean
  closesAt?: string
  size?: 'sm' | 'md'
  openLabel?: string
  closedLabel?: string
}

export function OpenStatus({ isOpen, closesAt, size = 'md', openLabel, closedLabel }: Props) {
  const small = size === 'sm'
  const dotSize = small ? 7 : 9
  const fontSize = small ? 12 : 13

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize, fontWeight: 600,
      color: isOpen ? 'var(--color-open)' : 'var(--color-closed)' }}>
      <span style={{ width: dotSize, height: dotSize, borderRadius: '50%', flexShrink: 0,
        background: isOpen ? 'var(--color-open)' : 'var(--color-closed)' }} />
      {isOpen
        ? (openLabel ?? (closesAt ? `Ouvert · ferme à ${closesAt}` : 'Ouvert'))
        : (closedLabel ?? 'Fermé')}
    </span>
  )
}
