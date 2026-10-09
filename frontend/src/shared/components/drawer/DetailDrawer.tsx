import type { ReactNode } from 'react'
import { Drawer } from '@mantine/core'

const DRAWER_PROPS = {
  position: 'right',
  size: 'clamp(24.125rem, 35vw, 30.5rem)',
  closeButtonProps: { 'aria-label': 'Cerrar' },
  transitionProps: { duration: 300, timingFunction: 'ease-out' },
  classNames: {
    content: 'flex flex-col overflow-hidden',
    body: 'flex-1 min-h-0 flex flex-col overflow-y-auto',
  },
} as const

interface DetailDrawerProps {
  opened: boolean
  onClose: () => void
  children: ReactNode
}

export function DetailDrawer({ opened, onClose, children }: DetailDrawerProps) {
  return (
    <Drawer opened={opened} onClose={onClose} {...DRAWER_PROPS}>
      {children}
    </Drawer>
  )
}
