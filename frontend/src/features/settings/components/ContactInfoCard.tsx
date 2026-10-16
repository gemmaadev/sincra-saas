import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil, Phone } from 'lucide-react'
import { Input, SincraButton } from '@/shared/components'
import { InfoField } from '@/shared/components/field'
import { notifySuccess } from '@/shared/utils/notify'
import { ApiError } from '@/shared/services'
import { EMAIL_PATTERN, PHONE_PATTERN } from '@/shared/utils'
import { useUpdateBusinessSettings } from '../hooks/useUpdateBusinessSettings'
import { SectionHeader } from './SectionHeader'
import type { BusinessSettings, UpdateBusinessSettingsInput } from '../types/settings.types'

type ContactField = 'email' | 'phone' | 'schedule'

interface ContactInfoCardProps {
  business: BusinessSettings
  canEdit: boolean
}

export function ContactInfoCard({ business, canEdit }: ContactInfoCardProps) {
  return (
    <section aria-label="Datos de contacto" className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0">
      <SectionHeader
        icon={<Phone size={24} aria-hidden="true" />}
        title="Datos de contacto"
        description="Gestiona cómo te pueden encontrar tus clientes."
      />

      <div className="flex flex-col divide-y divide-neutral-100">
        <ContactRow
          field="email"
          label="Email principal"
          value={business.email}
          canEdit={canEdit}
        />
        <ContactRow
          field="phone"
          label="Teléfono de contacto"
          value={business.phone}
          canEdit={canEdit}
        />
        <ContactRow
          field="schedule"
          label="Horario de atención"
          value={business.schedule}
          canEdit={canEdit}
        />
      </div>
    </section>
  )
}

interface ContactRowForm {
  value: string
}

interface ContactRowProps {
  field: ContactField
  label: string
  value: string | null
  canEdit: boolean
}

const FIELD_VALIDATION: Record<ContactField, object> = {
  email: { pattern: { value: EMAIL_PATTERN, message: 'Introduce un email válido' } },
  phone: { pattern: { value: PHONE_PATTERN, message: 'Introduce un teléfono válido' } },
  schedule: {},
}

function ContactRow({ field, label, value, canEdit }: ContactRowProps) {
  const updateBusinessSettings = useUpdateBusinessSettings()
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactRowForm>({ values: { value: value ?? '' } })

  function startEditing() {
    setIsEditing(true)
  }

  function cancelEditing() {
    reset()
    setIsEditing(false)
  }

  function onSubmit(data: ContactRowForm) {
    const input: UpdateBusinessSettingsInput = { [field]: data.value }
    updateBusinessSettings.mutate(input, {
      onSuccess: () => {
        setIsEditing(false)
        notifySuccess('Cambios guardados')
      },
    })
  }

  const submitError = updateBusinessSettings.isError
    ? updateBusinessSettings.error instanceof ApiError
      ? updateBusinessSettings.error.message
      : 'No se ha podido guardar el cambio. Inténtalo de nuevo.'
    : undefined

  return (
    <div className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label={label}
              error={errors.value?.message}
              {...register('value', FIELD_VALIDATION[field])}
            />
          </div>
          <SincraButton type="submit" size="sm" loading={updateBusinessSettings.isPending}>
            Guardar
          </SincraButton>
          <SincraButton type="button" variant="text" size="sm" onClick={cancelEditing}>
            Cancelar
          </SincraButton>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <InfoField label={label} value={value ?? 'Sin definir'} />
          {canEdit && (
            <SincraButton
              type="button"
              variant="secondary"
              size="icon"
              aria-label={`Editar ${label.toLowerCase()}`}
              onClick={startEditing}
            >
              <Pencil size={16} aria-hidden="true" />
            </SincraButton>
          )}
        </div>
      )}
      {submitError && <span className="text-sm text-error">{submitError}</span>}
    </div>
  )
}
