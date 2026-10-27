import type { ReactNode } from 'react'
import { Trash2, Plus, MapPin } from 'lucide-react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { Input, Select, SincraButton, IconButton } from '@/shared/components'
import { CHANNEL_BRANDS } from '@/shared/channels/channels'
import type { Coordinates } from '@/features/clients/types/client.types'
import { ClientSearch } from './ClientSearch'
import { toOrderFormValues, EMPTY_ITEM } from '../utils/toOrderFormValues'
import type { OrderDetail, OrderFormValues, ClientSearchResult } from '../types/order.types'

const CHANNEL_OPTIONS = CHANNEL_BRANDS.map((brand) => ({
  value: brand.id.toUpperCase(),
  label: brand.name,
}))

interface OrderFormProps {
  order?: OrderDetail
  initialLocation?: Coordinates
  onSubmit: (values: OrderFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
  submitError?: string
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

export function OrderForm({
  order,
  initialLocation,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
}: OrderFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<OrderFormValues>({ defaultValues: toOrderFormValues(order, initialLocation) })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const clientId = useWatch({ control, name: 'clientId' })
  const clientName = useWatch({ control, name: 'clientName' })
  const [latitude, longitude] = useWatch({ control, name: ['latitude', 'longitude'] })

  function handleSelectClient(client: ClientSearchResult) {
    setValue('clientId', client.id, { shouldValidate: true })
    setValue('clientName', client.name)
  }

  function handleChangeClient() {
    setValue('clientId', '')
    setValue('clientName', '')
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <FormSection title="Cliente">
        {clientId ? (
          <div className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2">
            <span className="text-ink">{clientName}</span>
            <SincraButton type="button" variant="text" size="sm" onClick={handleChangeClient}>
              Cambiar
            </SincraButton>
          </div>
        ) : (
          <ClientSearch onSelect={handleSelectClient} />
        )}
        <input
          type="hidden"
          {...register('clientId', {
            validate: (value) => value !== '' || 'Indica el cliente',
          })}
        />
        {errors.clientId && (
          <span role="alert" className="text-xs text-error">
            {errors.clientId.message}
          </span>
        )}
      </FormSection>

      <FormSection title="Productos">
        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 items-end gap-3">
              <div className="col-span-4">
                <Input
                  label="Producto"
                  error={errors.items?.[index]?.product?.message}
                  {...register(`items.${index}.product`, {
                    validate: (value) => value.trim() !== '' || 'Obligatorio',
                  })}
                />
              </div>
              <div className="col-span-3">
                <Input label="Descripción" {...register(`items.${index}.description`)} />
              </div>
              <div className="col-span-2">
                <Input
                  label="Cantidad"
                  type="number"
                  min={1}
                  error={errors.items?.[index]?.quantity?.message}
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                    min: { value: 1, message: 'Mín. 1' },
                  })}
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Precio"
                  type="number"
                  min={0.01}
                  step="0.01"
                  error={errors.items?.[index]?.unitPrice?.message}
                  {...register(`items.${index}.unitPrice`, {
                    valueAsNumber: true,
                    validate: (value) => value > 0 || 'Debe ser > 0',
                  })}
                />
              </div>
              <div className="col-span-1">
                {fields.length > 1 && (
                  <IconButton
                    type="button"
                    icon={Trash2}
                    label={`Quitar producto ${index + 1}`}
                    variant="danger"
                    onClick={() => remove(index)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <SincraButton
          type="button"
          variant="secondary"
          onClick={() => append(EMPTY_ITEM)}
        >
          <Plus size={16} aria-hidden="true" />
          Añadir producto
        </SincraButton>
      </FormSection>

      <FormSection title="Origen">
        <Select
          id="channel"
          label="Canal de origen"
          placeholder="Sin especificar"
          options={CHANNEL_OPTIONS}
          {...register('channel')}
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
        {latitude !== undefined && longitude !== undefined && (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <MapPin size={15} aria-hidden="true" />
            Ubicación elegida: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </p>
        )}
      </FormSection>

      <FormSection title="Entrega">
        <Input label="Fecha prevista" type="date" {...register('expectedDate')} />
      </FormSection>

      <FormSection title="Descripción">
        <div className="flex flex-col gap-1">
          <label htmlFor="order-description" className="font-medium text-ink">
            Descripción (opcional)
          </label>
          <textarea
            id="order-description"
            rows={3}
            placeholder="Si lo dejas en blanco, se resume a partir de los productos"
            {...register('description')}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-ink transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
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
          {order ? 'Guardar cambios' : 'Crear pedido'}
        </SincraButton>
      </div>
    </form>
  )
}
