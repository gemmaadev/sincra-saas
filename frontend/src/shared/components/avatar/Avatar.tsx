import { getInitials } from '@/shared/utils'
import { avatarSizes } from './avatar.variants'
import type { AvatarProps } from './avatar.types'

export function Avatar({
  src,
  name,
  size = 'md',
  online = false,
  roundness = 'full',
}: AvatarProps) {
  const borderRadius = {
    full: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none',
  }[roundness]

  return (
    <div className="relative inline-block">
      {src ? (
        <img src={src} alt={name} className={`object-cover ${avatarSizes[size]} ${borderRadius}`} />
      ) : (
        <div
          className={`flex items-center justify-center  ${borderRadius} bg-primary-light font-semibold text-primary ${avatarSizes[size]}`}
        >
          {getInitials(name)}
        </div>
      )}
      {online && (
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 ${borderRadius} bg-success ring-2 ring-white`}
        />
      )}
    </div>
  )
}
