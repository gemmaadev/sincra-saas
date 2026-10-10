import { useOrderDetail } from '../hooks/useOrderDetail'
import { OrderFormModal } from './OrderFormModal'

interface EditOrderModalProps {
  orderId: string
  opened: boolean
  onClose: () => void
}

export function EditOrderModal({ orderId, opened, onClose }: EditOrderModalProps) {
  const { data: order } = useOrderDetail(orderId)

  if (!order) return null

  return <OrderFormModal opened={opened} onClose={onClose} order={order} />
}
