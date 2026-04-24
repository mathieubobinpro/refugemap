'use client'
import { Icon } from './Icon'

interface Props {
  icon: string
  label: string
  primary?: boolean
  onClick?: () => void
  href?: string
  className?: string
}

export function ActionBtn({ icon, label, primary, onClick, href }: Props) {
  const style: React.CSSProperties = {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '14px 16px', borderRadius: 14, minHeight: 52,
    background: primary ? 'var(--color-primary)' : 'var(--color-surface)',
    border: primary ? 'none' : '1.5px solid var(--color-border)',
    color: primary ? '#fff' : 'var(--color-text)',
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    textDecoration: 'none',
  }

  if (href) {
    return (
      <a href={href} style={style}>
        <Icon name={icon} size={20} style={{ color: primary ? '#fff' : 'var(--color-primary)' }} />
        {label}
      </a>
    )
  }

  return (
    <button onClick={onClick} style={style}>
      <Icon name={icon} size={20} style={{ color: primary ? '#fff' : 'var(--color-primary)' }} />
      {label}
    </button>
  )
}
