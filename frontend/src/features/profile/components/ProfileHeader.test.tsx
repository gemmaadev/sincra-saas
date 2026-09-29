import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProfileHeader } from './ProfileHeader'
import type { User } from '@/features/auth/context/AuthContext'
import { api } from '@/shared/services'

vi.mock('@/shared/services', () => {
  class ApiError extends Error {
    status: number
    code: string
    constructor(message: string, status: number, code: string) {
      super(message)
      this.status = status
      this.code = code
    }
  }
  return {
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(), upload: vi.fn() },
    ApiError,
  }
})

const user: User = { id: '1', name: 'Laura García', email: 'laura@tienda.com', role: 'admin' }

const mockProfile = {
  id: '1',
  name: 'Laura García',
  email: 'laura@tienda.com',
  role: 'ADMIN' as const,
  avatarUrl: null,
  phone: '+34 600 123 456',
  notificationPrefs: null,
  createdAt: '2025-04-12T10:24:00.000Z',
}

function renderProfileHeader(profileOverrides: Partial<typeof mockProfile> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  vi.mocked(api.get).mockResolvedValue({ user: { ...mockProfile, ...profileOverrides } })

  return render(
    <QueryClientProvider client={queryClient}>
      <ProfileHeader user={user} />
    </QueryClientProvider>,
  )
}

describe('ProfileHeader', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.upload).mockReset()
  })

  // Given a user
  // When the header is rendered
  // Then the name, role badge and email should be visible
  it('renders the user name, role and email', () => {
    renderProfileHeader()
    expect(screen.getByRole('heading', { name: 'Laura García' })).toBeInTheDocument()
    expect(screen.getByText('Propietario/a')).toBeInTheDocument()
    expect(screen.getByText('laura@tienda.com')).toBeInTheDocument()
  })

  // Given an employee user
  // When the header is rendered
  // Then the employee role label should be used instead of the owner one
  it('shows the employee role label for employee users', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    vi.mocked(api.get).mockResolvedValue({ user: mockProfile })

    render(
      <QueryClientProvider client={queryClient}>
        <ProfileHeader user={{ ...user, role: 'employee' }} />
      </QueryClientProvider>,
    )

    expect(screen.getByText('Empleado/a')).toBeInTheDocument()
  })

  // Given no avatar has been uploaded yet
  // When the header is rendered
  // Then the avatar should show the user's initials, not a broken image
  it("shows the user's initials when there is no avatar yet", async () => {
    renderProfileHeader({ avatarUrl: null })

    await waitFor(() => {
      expect(screen.getByText('LG')).toBeInTheDocument()
    })
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  // Given the profile header
  // When the user picks a valid image and it uploads successfully
  // Then it should show a loading state and then the persisted avatar from the backend
  it('uploads the selected photo and shows the persisted avatar', async () => {
    renderProfileHeader({ avatarUrl: null })
    await waitFor(() => screen.getByText('LG'))
    vi.mocked(api.upload).mockResolvedValue({
      user: { ...mockProfile, avatarUrl: 'https://cdn.cloudinary.com/avatar.png' },
    })

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Cambiar foto de perfil'), {
      target: { files: [file] },
    })

    await waitFor(() => {
      expect(screen.getByAltText('Laura García')).toHaveAttribute(
        'src',
        'https://cdn.cloudinary.com/avatar.png',
      )
    })
    expect(api.upload).toHaveBeenCalledWith('/user/avatar', expect.any(FormData))
  })

  // Given a file that isn't an image
  // When the user selects it
  // Then it should show a validation error and never call the upload endpoint
  it('rejects a non-image file before uploading', async () => {
    renderProfileHeader()
    await waitFor(() => screen.getByRole('heading', { name: 'Laura García' }))

    const file = new File(['not an image'], 'file.txt', { type: 'text/plain' })
    fireEvent.change(screen.getByLabelText('Cambiar foto de perfil'), {
      target: { files: [file] },
    })

    expect(screen.getByText('El archivo debe ser una imagen.')).toBeInTheDocument()
    expect(api.upload).not.toHaveBeenCalled()
  })

  // Given an image larger than 2MB
  // When the user selects it
  // Then it should show a validation error and never call the upload endpoint
  it('rejects an oversized file before uploading', async () => {
    renderProfileHeader()
    await waitFor(() => screen.getByRole('heading', { name: 'Laura García' }))

    const oversizedFile = new File([new ArrayBuffer(2 * 1024 * 1024 + 1)], 'avatar.png', {
      type: 'image/png',
    })
    fireEvent.change(screen.getByLabelText('Cambiar foto de perfil'), {
      target: { files: [oversizedFile] },
    })

    expect(screen.getByText('La imagen no puede superar los 2MB.')).toBeInTheDocument()
    expect(api.upload).not.toHaveBeenCalled()
  })
})
