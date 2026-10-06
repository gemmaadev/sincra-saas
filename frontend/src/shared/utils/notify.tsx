import { notifications } from '@mantine/notifications'
import { Check } from 'lucide-react'

const SUCCESS_AUTO_CLOSE_MS = 4000

export function notifySuccess(message: string) {
  notifications.show({
    message,
    color: 'var(--color-success)',
    icon: <Check size={16} aria-hidden="true" />,
    autoClose: SUCCESS_AUTO_CLOSE_MS,
  })
}
