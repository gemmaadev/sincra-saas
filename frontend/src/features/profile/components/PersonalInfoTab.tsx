import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil, User as UserIcon } from 'lucide-react'
import { Input } from '@/shared/components/input'
import { SincraButton } from '@/shared/components/button'
import { Card } from '@/shared/components/card'
import { Badge } from '@/shared/components/badge'
import { InfoField, CopyableField } from '@/shared/components/field'
import { formatDate } from '@/shared/utils/date'
import type { User } from '@/features/auth/context/AuthContext'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import { SectionHeader } from './SectionHeader'
import { PHONE_PATTERN } from '@/shared/utils'

interface PersonalInfoForm {
  name: string
  phone: string
}

const roleLabels: Record<User['role'], string> = {
  admin: 'Propietario/a',
  employee: 'Empleado/a',
}

interface PersonalInfoTabProps {
  user: User
}

export function PersonalInfoTab({ user }: PersonalInfoTabProps) {
  const { login } = useAuth()
  const { data: profile, isLoading, isError } = useProfile()
  const updateProfile = useUpdateProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonalInfoForm>({
    values: { name: user.name, phone: profile?.phone ?? '' },
  })

  function startEditing() {
    setSaved(false)
    setError(null)
    setIsEditing(true)
  }

  function cancelEditing() {
    reset({ name: user.name, phone: profile?.phone ?? '' })
    setError(null)
    setIsEditing(false)
  }

  async function onSubmit(data: PersonalInfoForm) {
    setError(null)
    try {
      await updateProfile.mutateAsync({ name: data.name, phone: data.phone })
      await login()
      setIsEditing(false)
      setSaved(true)
    } catch {
      setError('No se pudieron guardar los cambios. Inténtalo de nuevo.')
    }
  }

  if (isLoading) {
    return (
      <Card className="flex flex-col gap-4">
        <SectionHeader icon={<UserIcon size={24} aria-hidden="true" />} title="Datos personales" />
        <p className="text-sm text-ink-muted">Cargando datos personales…</p>
      </Card>
    )
  }

  if (isError || !profile) {
    return (
      <Card className="flex flex-col gap-4">
        <SectionHeader icon={<UserIcon size={24} aria-hidden="true" />} title="Datos personales" />
        <p className="text-sm text-error">
          No se pudieron cargar tus datos. Inténtalo de nuevo más tarde.
        </p>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col gap-4">
      <SectionHeader
        icon={<UserIcon size={24} aria-hidden="true" />}
        title="Datos personales"
        action={
          !isEditing && (
            <SincraButton
              type="button"
              variant="secondary"
              size="sm"
              icon={<Pencil size={14} aria-hidden="true" />}
              onClick={startEditing}
            >
              Editar perfil
            </SincraButton>
          )
        }
      />

      {/* Fields that are never editable: always in the same position, never duplicated */}
      <div className="grid grid-cols-1 gap-4 border-b border-neutral-100 pb-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink-muted">Rol</span>
          <Badge color="primary" className="w-fit">
            {roleLabels[user.role]}
          </Badge>
        </div>
        <InfoField label="Fecha de alta" value={formatDate(new Date(profile.createdAt))} />
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Nombre"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 2, message: 'El nombre es demasiado corto' },
              })}
            />
            <Input label="Correo electrónico" value={user.email} disabled readOnly />
            <Input
              label="Teléfono"
              type="tel"
              autoComplete="tel"
              placeholder="+34 600 123 456"
              error={errors.phone?.message}
              {...register('phone', {
                pattern: { value: PHONE_PATTERN, message: 'Introduce un teléfono válido' },
              })}
            />
          </div>
          <div className="flex items-center gap-3">
            <SincraButton type="submit" loading={isSubmitting}>
              Guardar cambios
            </SincraButton>
            <SincraButton type="button" variant="text" onClick={cancelEditing}>
              Cancelar
            </SincraButton>
            {error && <span className="text-sm text-error">{error}</span>}
          </div>
        </form>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-100">
          <div className="grid grid-cols-1 gap-4 py-3 first:pt-0 sm:grid-cols-2 lg:grid-cols-3">
            <InfoField label="Nombre" value={user.name} />
          </div>
          <div className="grid grid-cols-1 gap-4 py-3 last:pb-0 sm:grid-cols-2 lg:grid-cols-3">
            <CopyableField label="Correo electrónico" value={user.email} />
            <CopyableField label="Teléfono" value={profile.phone ?? 'Sin definir'} />
          </div>
          {saved && <span className="pt-3 text-sm text-success">Cambios guardados</span>}
        </div>
      )}
    </Card>
  )
}
