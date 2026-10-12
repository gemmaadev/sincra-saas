import { useForm, useWatch } from 'react-hook-form'
import { Input, SincraButton } from '@/shared/components'
import { CalendarEventLinkField } from './CalendarEventLinkField'
import { toCalendarEventFormValues } from '../utils/toCalendarEventFormValues'
import type {
  CalendarClientSearchResult,
  CalendarEventFormValues,
  CalendarEventLinkType,
  CalendarItem,
  CalendarOrderSearchResult,
} from '../types/calendar.types'

interface EventFormProps {
  event?: CalendarItem
  initialDate?: Date
  onSubmit: (values: CalendarEventFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
  submitError?: string
}

export function EventForm({
  event,
  initialDate,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CalendarEventFormValues>({
    defaultValues: toCalendarEventFormValues(event, initialDate),
  })

  const linkType = useWatch({ control, name: 'linkType' })
  const clientName = useWatch({ control, name: 'clientName' })
  const orderLabel = useWatch({ control, name: 'orderLabel' })

  function handleLinkTypeChange(nextLinkType: CalendarEventLinkType) {
    setValue('linkType', nextLinkType)
    setValue('clientId', '')
    setValue('clientName', '')
    setValue('orderId', '')
    setValue('orderLabel', '')
  }

  function handleSelectClient(client: CalendarClientSearchResult) {
    setValue('clientId', client.id, { shouldValidate: true })
    setValue('clientName', client.name)
  }

  function handleSelectOrder(order: CalendarOrderSearchResult) {
    setValue('orderId', order.id, { shouldValidate: true })
    setValue('orderLabel', `Pedido #${order.number} - ${order.clientName}`)
  }

  function handleClearSelection() {
    setValue('clientId', '')
    setValue('clientName', '')
    setValue('orderId', '')
    setValue('orderLabel', '')
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Input
        label="Título del evento"
        error={errors.title?.message}
        {...register('title', { validate: (value) => value.trim() !== '' || 'Obligatorio' })}
      />

      <div className="grid grid-cols-2 gap-5">
        <Input
          label="Fecha"
          type="date"
          error={errors.date?.message}
          {...register('date', { validate: (value) => value !== '' || 'Obligatorio' })}
        />
        <Input
          label="Hora"
          type="time"
          error={errors.time?.message}
          {...register('time', { validate: (value) => value !== '' || 'Obligatorio' })}
        />
      </div>

      <CalendarEventLinkField
        linkType={linkType}
        clientName={clientName}
        orderLabel={orderLabel}
        onLinkTypeChange={handleLinkTypeChange}
        onSelectClient={handleSelectClient}
        onSelectOrder={handleSelectOrder}
        onClearSelection={handleClearSelection}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="event-description" className="font-medium text-ink">
          Descripción (opcional)
        </label>
        <textarea
          id="event-description"
          rows={3}
          {...register('description')}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-ink transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

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
          {event ? 'Guardar cambios' : 'Crear evento'}
        </SincraButton>
      </div>
    </form>
  )
}
