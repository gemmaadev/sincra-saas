import type { ReactNode } from 'react'
import { Modal } from '@mantine/core'

const MODAL_PROPS = {
  centered: true,
  radius: 'lg',
  padding: 'xl',
  overlayProps: { backgroundOpacity: 0.35, blur: 3 },
  closeButtonProps: { 'aria-label': 'Cerrar' },
  styles: {
    header: {
      borderBottom: '1px solid var(--color-neutral-100)',
      paddingBottom: 'var(--mantine-spacing-md)',
      marginBottom: 'var(--mantine-spacing-lg)',
    },
  },
} as const

interface SincraModalProps {
  opened: boolean
  onClose: () => void
  title: string
  icon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function SincraModal({
  opened,
  onClose,
  title,
  icon,
  size = 'lg',
  children,
}: SincraModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={size}
      title={
        <span className="flex items-center gap-3">
          {icon && <span className="flex size-9 items-center justify-center">{icon}</span>}
          <span className="text-lg font-semibold text-ink">{title}</span>
        </span>
      }
      {...MODAL_PROPS}
    >
      {children}
    </Modal>
  )
}
