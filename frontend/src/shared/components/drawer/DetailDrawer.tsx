import type { ReactNode } from 'react'
import { Drawer } from '@mantine/core'

const DRAWER_PROPS = {
  position: 'right',
  size: 'lg',
  closeButtonProps: { 'aria-label': 'Cerrar' },
  transitionProps: { duration: 300, timingFunction: 'ease-out' },
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
