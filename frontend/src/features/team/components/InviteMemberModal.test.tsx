import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '@/shared/services'
import { notifySuccess } from '@/shared/utils/notify'
import { withQueryClient } from '@/shared/test/withQueryClient'
import { InviteMemberModal } from './InviteMemberModal'

vi.mock('@/shared/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/services')>()
  return { ...actual, api: { post: vi.fn() } }
})

vi.mock('@/shared/utils/notify', () => ({ notifySuccess: vi.fn() }))

function renderModal(props: Partial<React.ComponentProps<typeof InviteMemberModal>> = {}) {
  const onClose = vi.fn()
  render(
    withQueryClient(
      <MantineProvider>
        <InviteMemberModal opened onClose={onClose} {...props} />
      </MantineProvider>,
    ),
  )
  return { onClose: props.onClose ?? onClose, user: userEvent.setup() }
}

describe('InviteMemberModal', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset()
    vi.mocked(notifySuccess).mockReset()
  })

  // Given the modal is open
  // When it is rendered
  // Then it should be titled "Invitar empleado"
  it('shows the "Invitar empleado" title', () => {
    renderModal()
    expect(screen.getByRole('dialog', { name: 'Invitar empleado' })).toBeInTheDocument()
  })

  // Given the modal is closed
  // When it is rendered
  // Then nothing should be shown
  it('renders nothing when it is not opened', () => {
    renderModal({ opened: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // Given the modal is open
  // When the user clicks the close button
  // Then onClose should be called
  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    renderModal({ onClose })

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // Given a valid name and email
  // When the user submits the form
  // Then the invite should be sent and the modal closed
  it('sends the invite and closes the modal', async () => {
    vi.mocked(api.post).mockResolvedValue({ success: true })
    const { onClose, user } = renderModal()

    await user.type(screen.getByLabelText('Nombre'), 'Marta Soler')
    await user.type(screen.getByLabelText('Email'), 'marta@sincra.app')
    await user.click(screen.getByRole('button', { name: 'Enviar invitación' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(notifySuccess).toHaveBeenCalledWith('Invitación enviada')
    expect(api.post).toHaveBeenCalledWith('/team/invite', {
      name: 'Marta Soler',
      email: 'marta@sincra.app',
    })
  })

  // Given the backend rejects the invite with a message
  // When the user submits the form
  // Then that message should be shown and the modal should stay open
  it('shows the backend error and stays open when the invite fails', async () => {
    vi.mocked(api.post).mockRejectedValue(
      new ApiError('Este usuario ya pertenece a este negocio', 409, 'ALREADY_MEMBER'),
    )
    const { onClose, user } = renderModal()

    await user.type(screen.getByLabelText('Nombre'), 'Marta Soler')
    await user.type(screen.getByLabelText('Email'), 'marta@sincra.app')
    await user.click(screen.getByRole('button', { name: 'Enviar invitación' }))

    expect(await screen.findByText('Este usuario ya pertenece a este negocio')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
    expect(notifySuccess).not.toHaveBeenCalled()
  })

  // Given an unexpected failure that is not an API error
  // When the user submits the form
  // Then a generic error message should be shown
  it('shows a generic error when the invite fails unexpectedly', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('network down'))
    const { user } = renderModal()

    await user.type(screen.getByLabelText('Nombre'), 'Marta Soler')
    await user.type(screen.getByLabelText('Email'), 'marta@sincra.app')
    await user.click(screen.getByRole('button', { name: 'Enviar invitación' }))

    expect(
      await screen.findByText('No se ha podido enviar la invitación. Inténtalo de nuevo.'),
    ).toBeInTheDocument()
  })

  // Given the form is invalid (no name or email)
  // When the user submits it
  // Then nothing should be sent to the API
  it('does not call the API when the form is invalid', async () => {
    const { user } = renderModal()

    await user.click(screen.getByRole('button', { name: 'Enviar invitación' }))

    expect(await screen.findAllByText('Obligatorio')).toHaveLength(2)
    expect(api.post).not.toHaveBeenCalled()
  })
})
