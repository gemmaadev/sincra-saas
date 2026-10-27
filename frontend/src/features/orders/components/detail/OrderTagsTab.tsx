import { TagsTab } from '@/features/tags/components/TagsTab'
import { useAssignOrderTag } from '../hooks/useAssignOrderTag'
import { useRemoveOrderTag } from '../hooks/useRemoveOrderTag'
import type { OrderDetail } from '../types/order.types'

interface OrderTagsTabProps {
  order: OrderDetail
}

export function OrderTagsTab({ order }: OrderTagsTabProps) {
  const assignTag = useAssignOrderTag(order.id)
  const removeTag = useRemoveOrderTag(order.id)

  return (
    <TagsTab
      assignedTags={order.orderTags}
      assignTag={assignTag}
      removeTag={removeTag}
      emptyMessage="Este pedido no tiene etiquetas todavía."
      ariaLabel="Etiquetas del pedido"
    />
  )
}
