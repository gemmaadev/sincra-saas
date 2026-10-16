import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil, Building2 } from 'lucide-react'
import { Input, Select, SincraButton, Card } from '@/shared/components'
import { InfoField } from '@/shared/components/field'
import { notifySuccess } from '@/shared/utils/notify'
import { ApiError } from '@/shared/services'
import { sectorLabel } from '@/shared/utils'
import { SECTOR_OPTIONS } from '@/shared/sectorOptions.constants'
import { useUpdateBusinessSettings } from '../hooks/useUpdateBusinessSettings'
import { SectionHeader } from './SectionHeader'
import type { BusinessSettings } from '../types/settings.types'

interface BusinessInfoForm {
  name: string
  sector: string
  nif: string
  address: string
}

interface BusinessInfoCardProps {
  business: BusinessSettings
  canEdit: boolean
}

export function BusinessInfoCard({ business, canEdit }: BusinessInfoCardProps) {
  const updateBusinessSettings = useUpdateBusinessSettings()
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusinessInfoForm>({
    values: {
      name: business.name,
      sector: business.sector ?? '',
      nif: business.nif ?? '',
      address: business.address ?? '',
    },
  })

  function startEditing() {
    setIsEditing(true)
  }

  function cancelEditing() {
    reset()
    setIsEditing(false)
  }

  function onSubmit(data: BusinessInfoForm) {
    updateBusinessSettings.mutate(data, {
      onSuccess: () => {
        setIsEditing(false)
        notifySuccess('Cambios guardados')
      },
    })
  }

  const submitError = updateBusinessSettings.isError
    ? updateBusinessSettings.error instanceof ApiError
      ? updateBusinessSettings.error.message
      : 'No se han podido guardar los cambios. Inténtalo de nuevo.'
    : undefined

  return (
    <Card className="flex flex-col gap-4">
      <SectionHeader
        icon={<Building2 size={24} aria-hidden="true" />}
        title="Información del negocio"
        description="Datos básicos de tu comercio o ecommerce."
        action={
          canEdit &&
          !isEditing && (
            <SincraButton
              type="button"
              variant="secondary"
              size="sm"
              icon={<Pencil size={14} aria-hidden="true" />}
              onClick={startEditing}
            >
              Editar
            </SincraButton>
          )
        }
      />

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nombre comercial"
              error={errors.name?.message}
              {...register('name', { required: 'El nombre es obligatorio' })}
            />
            <Select
              id="business-sector"
              label="Tipo de negocio"
              placeholder="Selecciona un tipo"
              options={SECTOR_OPTIONS}
              {...register('sector')}
            />
            <Input label="CIF / NIF" {...register('nif')} />
            <Input label="Dirección" {...register('address')} />
          </div>
          <div className="flex items-center gap-3">
            <SincraButton type="submit" loading={updateBusinessSettings.isPending}>
              Guardar cambios
            </SincraButton>
            <SincraButton type="button" variant="text" onClick={cancelEditing}>
              Cancelar
            </SincraButton>
            {submitError && <span className="text-sm text-error">{submitError}</span>}
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoField label="Nombre comercial" value={business.name} />
          <InfoField label="Tipo de negocio" value={sectorLabel(business.sector) ?? 'Sin definir'} />
          <InfoField label="CIF / NIF" value={business.nif ?? 'Sin definir'} />
          <InfoField label="Dirección" value={business.address ?? 'Sin definir'} />
        </div>
      )}
    </Card>
  )
}
