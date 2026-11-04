import { Package } from 'lucide-react'
import { SincraModal } from '@/shared/components'
import { ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import type { Coordinates } from '@/features/clients/types/client.types'
import { useSaveOrder } from '../../hooks/useSaveOrder'
import { OrderForm } from './OrderForm'
import type { OrderDetail, OrderFormValues } from '../../types/order.types'

interface OrderFormModalProps {
  opened: boolean
  onClose: () => void
  order?: OrderDetail
  initialLocation?: Coordinates
}

export function OrderFormModal({ opened, onClose, order, initialLocation }: OrderFormModalProps) {
  const isEditing = order !== undefined
  const saveOrder = useSaveOrder(order?.id)

  function handleClose() {
    saveOrder.reset()
    onClose()
  }

  function handleSaved() {
    notifySuccess(isEditing ? 'Pedido actualizado' : 'Pedido creado')
    handleClose()
  }

  function handleSubmit(values: OrderFormValues) {
    saveOrder.mutate(values, { onSuccess: handleSaved })
  }

  const submitError = saveOrder.isError
    ? saveOrder.error instanceof ApiError
      ? saveOrder.error.message
      : 'No se ha podido guardar el pedido. Inténtalo de nuevo.'
    : undefined

  return (
    <SincraModal
      opened={opened}
      onClose={handleClose}
      title={isEditing ? 'Editar pedido' : 'Nuevo pedido'}
      icon={<Package size={26} className="text-primary" aria-hidden="true" />}
    >
      <OrderForm
        order={order}
        initialLocation={initialLocation}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isSubmitting={saveOrder.isPending}
        submitError={submitError}
      />
    </SincraModal>
  )
}
