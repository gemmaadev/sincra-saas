import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi } from 'vitest'
import { ChannelAccountEmailModal } from './ChannelAccountEmailModal'

function renderModal(props: Partial<React.ComponentProps<typeof ChannelAccountEmailModal>> = {}) {
  const onConfirm = vi.fn()
  const onClose = vi.fn()
  render(
    <MantineProvider>
      <ChannelAccountEmailModal
        opened
        channelName="Outlook"
        purpose="connect"
        onClose={onClose}
        onConfirm={onConfirm}
        {...props}
      />
    </MantineProvider>,
  )
  return { onConfirm, onClose, user: userEvent.setup() }
}

describe('ChannelAccountEmailModal', () => {
  // Given the modal is open to connect Outlook
  // When it renders
  // Then it asks for the account email in Spanish
  it('asks for the account email', () => {
    renderModal()

    expect(screen.getByRole('dialog', { name: 'Conectar Outlook' })).toBeInTheDocument()
    expect(
      screen.getByText('Escribe el email de la cuenta que quieres conectar.'),
    ).toBeInTheDocument()
  })

  // Given an empty email
  // When the form is submitted
  // Then it stays open and does not confirm
  it('requires a valid email', async () => {
    const { user, onConfirm } = renderModal()
    const dialog = screen.getByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: 'Conectar' }))
    expect(within(dialog).getByText('Obligatorio')).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText('Email'), 'correo')
    await user.click(within(dialog).getByRole('button', { name: 'Conectar' }))

    expect(within(dialog).getByText('Introduce un email válido')).toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  // Given a mixed-case email
  // When the form is submitted
  // Then the confirmed value is trimmed and lowercase
  it('confirms the email trimmed and in lowercase', async () => {
    const { user, onConfirm } = renderModal({ asksGoogle: true, channelName: 'Gmail' })
    const dialog = screen.getByRole('dialog', { name: 'Conectar Gmail' })

    await user.type(within(dialog).getByLabelText('Email'), '  Tienda@Gmail.com ')
    await user.click(within(dialog).getByRole('button', { name: 'Continuar' }))

    expect(onConfirm).toHaveBeenCalledWith('tienda@gmail.com')
  })
})
