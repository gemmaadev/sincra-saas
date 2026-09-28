import { useState } from 'react'
import { Camera } from 'lucide-react'
import { Avatar } from '@/shared/components/avatar'
import { Badge } from '@/shared/components/badge'
import type { User } from '@/features/auth/context/AuthContext'

// TODO: (backend/user-feature): avatarUrl does not yet exist in the User of the
// AuthContext. It is mocked until the backend exposes this field via GET /user/profile and it can live in the AuthContext
const MOCK_AVATAR_URL = 'https://i.pravatar.cc/150?img=41'

const roleLabels: Record<User['role'], string> = {
  admin: 'Propietario/a',
  employee: 'Empleado/a',
}

interface ProfileHeaderProps {
  user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [avatarUrl, setAvatarUrl] = useState(MOCK_AVATAR_URL)

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setAvatarUrl(URL.createObjectURL(file))
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <label className="relative inline-block cursor-pointer">
        <Avatar src={avatarUrl} name={user.name} size="lg" />
        <span className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border-2 border-surface-card bg-primary text-white">
          <Camera size={12} aria-hidden="true" />
        </span>
        <span className="sr-only">Cambiar foto de perfil</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </label>

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-ink">{user.name}</h1>
          <Badge color="primary">{roleLabels[user.role]}</Badge>
        </div>
        <p className="text-sm text-ink-muted">{user.email}</p>
      </div>
    </div>
  )
}
