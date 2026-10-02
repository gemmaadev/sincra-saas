import type { SkeletonProps } from './skeleton.types'

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`animate-pulse rounded bg-neutral-100 ${className}`}
    />
  )
}
