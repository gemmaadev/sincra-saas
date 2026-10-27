import { useClientDetail } from '../hooks/useClientDetail'
import { ClientFormModal } from './ClientFormModal'

interface EditClientModalProps {
  clientId: string
  opened: boolean
  onClose: () => void
}

export function EditClientModal({ clientId, opened, onClose }: EditClientModalProps) {
  const { data: client } = useClientDetail(clientId)

  if (!client) return null

  return <ClientFormModal opened={opened} onClose={onClose} client={client} />
}
