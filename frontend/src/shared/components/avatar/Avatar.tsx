import { getInitials } from '@/shared/utils'
import { avatarSizes } from './avatar.variants'
import type { AvatarProps } from './avatar.types'

export function Avatar({ src, name, size = 'md', online = false }: AvatarProps) {
  return (
    <div className="relative inline-block">
      {src ? (
        <img src={src} alt={name} className={`rounded-full object-cover ${avatarSizes[size]}`} />
      ) : (
        <div
          className={`flex items-center justify-center rounded-full bg-primary-light font-semibold text-primary ${avatarSizes[size]}`}
        >
          {getInitials(name)}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-white" />
      )}
    </div>
  )
}
