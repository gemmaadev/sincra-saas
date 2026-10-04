import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Input, Checkbox } from '@/shared/components'
import { CHANNEL_BRANDS } from '@/shared/channels/channels'
import type { ChannelFilter, ClientDetail, ClientFormValues } from '../types/client.types'

interface ClientFormProps {
  client?: ClientDetail
}

function toFormValues(client?: ClientDetail): ClientFormValues {
  return {
    name: client?.name ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    channels: client?.channels ?? [],
    type: client?.type ?? '',
    zone: client?.zone ?? '',
    address: client?.address ?? '',
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

export function ClientForm({ client }: ClientFormProps) {
  const { register } = useForm<ClientFormValues>({ defaultValues: toFormValues(client) })

  return (
    <form noValidate className="flex flex-col gap-8">
      <FormSection title="Contacto">
        <Input label="Nombre" {...register('name')} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input label="Email" type="email" {...register('email')} />
          <Input label="Teléfono" type="tel" {...register('phone')} />
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
                    {...register('channels')}
                  />
                </div>
              )
            })}
          </div>
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
      </FormSection>
    </form>
  )
}
