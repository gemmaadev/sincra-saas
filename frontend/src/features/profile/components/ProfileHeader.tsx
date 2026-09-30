import { useState } from 'react'
import { Camera } from 'lucide-react'
import { Avatar } from '@/shared/components/avatar'
import { Badge } from '@/shared/components/badge'
import type { User } from '@/features/auth/context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { useUploadAvatar } from '../hooks/useUploadAvatar'

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024

const roleLabels: Record<User['role'], string> = {
  admin: 'Propietario/a',
  employee: 'Empleado/a',
}

interface ProfileHeaderProps {
  user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { data: profile } = useProfile()
  const uploadAvatar = useUploadAvatar()
  const [error, setError] = useState<string | null>(null)

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.')
      return
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError('La imagen no puede superar los 2MB.')
      return
    }

    uploadAvatar.mutate(file, {
      onError: () => setError('No se pudo subir la foto. Inténtalo de nuevo.'),
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <label className="relative inline-block cursor-pointer">
        <Avatar src={profile?.avatarUrl ?? undefined} name={user.name} size="lg" />
        <span className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border-2 border-surface-card bg-primary text-white">
          <Camera size={12} aria-hidden="true" />
        </span>
        <input
          type="file"
          aria-label="Cambiar foto de perfil"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
          disabled={uploadAvatar.isPending}
        />
      </label>

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold text-ink">{user.name}</h1>
          <Badge color="primary">{roleLabels[user.role]}</Badge>
        </div>
        <p className="text-sm text-ink-muted">{user.email}</p>
        {uploadAvatar.isPending && <p className="text-sm text-ink-muted">Subiendo foto…</p>}
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    </div>
  )
}
