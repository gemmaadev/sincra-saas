import type { ReactNode } from 'react'

interface SectionProps {
  id?: string
  children: ReactNode
  className?: string
}

export function Section({ id, children, className = '' }: SectionProps) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden px-20 py-20 max-lg:px-12 max-md:px-6 max-md:py-16 ${className}`}
    >
      {children}
    </section>
  )
}
