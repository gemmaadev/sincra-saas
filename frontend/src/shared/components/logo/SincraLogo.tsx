import { useId } from 'react'

type IconVariant = 'gradient' | 'white'

export function SincraIcon({
  size = 32,
  variant = 'gradient',
}: {
  size?: number
  variant?: IconVariant
}) {
  const id = useId()
  const topGradient = `sincra-top-${id}`
  const bottomGradient = `sincra-bottom-${id}`

  if (variant === 'white') {
    return (
      <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
        <path
          d="M16 4H34C38.4 4 42 7.6 42 12S38.4 20 34 20H24L30 28H17C10.9 28 6 23.1 6 17V14C6 8.5 10.5 4 16 4Z"
          fill="#fff"
        />
        <path
          d="M32 44H14C9.6 44 6 40.4 6 36S9.6 28 14 28H24L18 20H31C37.1 20 42 24.9 42 31V34C42 39.5 37.5 44 32 44Z"
          fill="#fff"
          fillOpacity="0.85"
        />
        <path d="M18 20H24L30 28H24Z" fill="#fff" fillOpacity="0.6" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient
          id={topGradient}
          x1="6"
          y1="4"
          x2="42"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="color-mix(in srgb, var(--color-primary) 70%, white)" />
          <stop offset="1" stopColor="var(--color-primary)" />
        </linearGradient>
        <linearGradient
          id={bottomGradient}
          x1="6"
          y1="44"
          x2="42"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="color-mix(in srgb, var(--color-primary) 70%, black)" />
          <stop offset="1" stopColor="var(--color-primary)" />
        </linearGradient>
      </defs>
      <path
        d="M16 4H34C38.4 4 42 7.6 42 12S38.4 20 34 20H24L30 28H17C10.9 28 6 23.1 6 17V14C6 8.5 10.5 4 16 4Z"
        fill={`url(#${topGradient})`}
      />
      <path
        d="M32 44H14C9.6 44 6 40.4 6 36S9.6 28 14 28H24L18 20H31C37.1 20 42 24.9 42 31V34C42 39.5 37.5 44 32 44Z"
        fill={`url(#${bottomGradient})`}
      />
      <path d="M18 20H24L30 28H24Z" fill="var(--color-primary-dark)" />
    </svg>
  )
}

export function SincraLogo({
  size = 32,
  variant = 'gradient',
  color,
  className,
}: {
  size?: number
  variant?: IconVariant
  color?: string
  className?: string
}) {
  const textColor = color ?? (variant === 'white' ? '#fff' : 'var(--color-primary-dark)')

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.32 }}
    >
      <SincraIcon size={size} variant={variant} />
      <span
        style={{
          fontSize: size * 0.92,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: textColor,
        }}
      >
        Sincra
      </span>
    </span>
  )
}
