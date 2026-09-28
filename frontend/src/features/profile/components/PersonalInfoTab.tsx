import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil, User as UserIcon } from 'lucide-react'
import { Input } from '@/shared/components/input'
import { Select } from '@/shared/components/select'
import { SincraButton } from '@/shared/components/button'
import { Card } from '@/shared/components/card'
import { Badge } from '@/shared/components/badge'
import { InfoField, CopyableField } from '@/shared/components/field'
import { formatDate, formatDateTime } from '@/shared/utils/date'
import type { User } from '@/features/auth/context/AuthContext'
import { SectionHeader } from './SectionHeader'

// TODO: (backend/user-feature): phone, language, lastLoginAt and createdAt do not exist
// yet in the User of the AuthContext. They are mocked here until the backend
// exposes these fields via GET /api/user/profile.
const MOCK_PHONE = '+34 722 723 132'
const MOCK_LANGUAGE = 'es'
const MOCK_CREATED_AT = new Date('2026-10-12T10:24:00')
const MOCK_LAST_LOGIN_AT = new Date()

const PHONE_PATTERN = /^[+\d][\d\s]{6,}$/

const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'ca', label: 'Català' },
]

const languageLabels: Record<string, string> = Object.fromEntries(
  LANGUAGE_OPTIONS.map((option) => [option.value, option.label]),
)

interface PersonalInfoForm {
  name: string
  phone: string
  language: string
}

const roleLabels: Record<User['role'], string> = {
  admin: 'Propietario/a',
  employee: 'Empleado/a',
}

interface PersonalInfoTabProps {
  user: User
}

export function PersonalInfoTab({ user }: PersonalInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonalInfoForm>({
    defaultValues: { name: user.name, phone: MOCK_PHONE, language: MOCK_LANGUAGE },
  })

  function startEditing() {
    setSaved(false)
    setIsEditing(true)
  }

  function cancelEditing() {
    reset({ name: user.name, phone: MOCK_PHONE, language: MOCK_LANGUAGE })
    setIsEditing(false)
  }

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 400))
    setIsEditing(false)
    setSaved(true)
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
        <InfoField label="Fecha de alta" value={formatDate(MOCK_CREATED_AT)} />
        <InfoField label="Último acceso" value={formatDateTime(MOCK_LAST_LOGIN_AT)} />
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
            <Select
              id="language"
              label="Idioma"
              options={LANGUAGE_OPTIONS}
              {...register('language')}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SincraButton type="submit" loading={isSubmitting}>
              Guardar cambios
            </SincraButton>
            <SincraButton type="button" variant="text" onClick={cancelEditing}>
              Cancelar
            </SincraButton>
          </div>
        </form>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-100">
          <div className="grid grid-cols-1 gap-4 py-3 first:pt-0 sm:grid-cols-2 lg:grid-cols-3">
            <InfoField label="Nombre" value={user.name} />
            <InfoField label="Idioma" value={languageLabels[MOCK_LANGUAGE]} />
          </div>
          <div className="grid grid-cols-1 gap-4 py-3 last:pb-0 sm:grid-cols-2 lg:grid-cols-3">
            <CopyableField label="Correo electrónico" value={user.email} />
            <CopyableField label="Teléfono" value={MOCK_PHONE} />
          </div>
          {saved && <span className="pt-3 text-sm text-success">Cambios guardados</span>}
        </div>
      )}
    </Card>
  )
}
