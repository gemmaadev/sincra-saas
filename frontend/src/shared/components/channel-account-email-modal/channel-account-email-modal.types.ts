export type ChannelEmailPurpose = 'connect' | 'add' | 'edit'

export interface ChannelAccountEmailModalProps {
  opened: boolean
  channelName: string
  purpose: ChannelEmailPurpose
  asksGoogle?: boolean
  initialEmail?: string
  loading?: boolean
  onClose: () => void
  onConfirm: (email: string) => void
}

export interface ChannelAccountEmailFormValues {
  email: string
}

export interface ChannelAccountEmailFormProps {
  initialEmail: string
  description: string
  submitLabel: string
  loading: boolean
  onClose: () => void
  onConfirm: (email: string) => void
}
