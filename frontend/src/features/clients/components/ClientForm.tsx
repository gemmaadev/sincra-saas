import type { ReactNode } from 'react'
import { MapPin } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Input, Checkbox, SincraButton } from '@/shared/components'
import { EMAIL_PATTERN, PHONE_PATTERN } from '@/shared/utils'
import { CHANNEL_BRANDS } from '@/shared/channels/channels'
import type {
  ChannelFilter,
  ClientDetail,
  ClientFormValues,
  Coordinates,
} from '../types/client.types'

interface ClientFormProps {
  client?: ClientDetail
  initialLocation?: Coordinates
  onSubmit: (values: ClientFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
  submitError?: string
}

function toFormValues(client?: ClientDetail, initialLocation?: Coordinates): ClientFormValues {
  return {
    name: client?.name ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    channels: client?.channels ?? [],
    type: client?.type ?? '',
    zone: client?.zone ?? '',
    address: client?.address ?? '',
    ...(!client && initialLocation),
  }
}

interface FormSectionProps {
  title: string
  children: ReactNode
}

function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="flex flex-col gap-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{title}</h3>
      {children}
    </section>
  )
}

export function ClientForm({
  client,
  initialLocation,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({ defaultValues: toFormValues(client, initialLocation) })

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <FormSection title="Contacto">
        <Input
          label="Nombre"
          error={errors.name?.message}
          {...register('name', {
            validate: (value) => value.trim() !== '' || 'El nombre es obligatorio',
          })}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email', {
              pattern: { value: EMAIL_PATTERN, message: 'Introduce un email válido' },
            })}
          />
          <Input
            label="Teléfono"
            type="tel"
            error={errors.phone?.message}
            {...register('phone', {
              pattern: { value: PHONE_PATTERN, message: 'Introduce un teléfono válido' },
            })}
          />
        </div>
      </FormSection>

      <FormSection title="Origen">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-medium text-ink">Canales de origen</legend>
          <div className="flex flex-wrap gap-3">
            {CHANNEL_BRANDS.map((brand) => {
              const Icon = brand.icon
              return (
                <div
                  key={brand.id}
                  className="rounded-lg border border-neutral-100 px-3 py-2 transition-colors has-checked:border-primary has-checked:bg-primary-light"
                >
                  <Checkbox
                    value={brand.id.toUpperCase() as ChannelFilter}
                    label={
                      <span className="flex items-center gap-1.5 text-ink">
                        <Icon size={16} className={brand.colorClassName} aria-hidden="true" />
                        {brand.name}
                      </span>
                    }
                    {...register('channels', {
                      validate: (value) =>
                        value.length > 0 || 'Indica al menos un canal de contacto',
                    })}
                  />
                </div>
              )
            })}
          </div>
          {errors.channels && (
            <span role="alert" className="text-xs text-error">
              {errors.channels.message}
            </span>
          )}
        </fieldset>
        <Input
          label="Tipo de cliente"
          placeholder="Particular, empresa, mayorista..."
          {...register('type')}
        />
      </FormSection>

      <FormSection title="Ubicación">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input label="Zona" placeholder="Ej. Barcelona" {...register('zone')} />
          <Input
            label="Dirección"
            placeholder="Ej. Carrer de Mallorca 123"
            {...register('address')}
          />
        </div>
        {!client && initialLocation && (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <MapPin size={15} aria-hidden="true" />
            Ubicación elegida en el mapa: {initialLocation.latitude.toFixed(5)},{' '}
            {initialLocation.longitude.toFixed(5)}
          </p>
        )}
      </FormSection>

      {submitError && (
        <p role="alert" className="text-sm text-error">
          {submitError}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-neutral-100 pt-5">
        <SincraButton type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </SincraButton>
        <SincraButton type="submit" loading={isSubmitting}>
          {client ? 'Guardar cambios' : 'Crear cliente'}
        </SincraButton>
      </div>
    </form>
  )
}
