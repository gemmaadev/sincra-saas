import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { LogOut, Monitor, ShieldCheck } from 'lucide-react'
import { Card } from '@/shared/components/card'
import { SincraButton } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { PasswordInput } from '@/shared/components/input/PasswordInput'
import { ApiError } from '@/shared/services'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useChangePassword } from '../hooks/useChangePassword'
import { SectionHeader } from './SectionHeader'
import { notifySuccess } from '@/shared/utils/notify'

interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface Session {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
}

//Active sessions do not yet exist in the backend. They are mocked here until GET /user/sessions exists.
const MOCK_SESSIONS: Session[] = [
  {
    id: 'session-1',
    device: 'MacBook Pro',
    location: 'Chrome · Barcelona, España',
    lastActive: 'Activa ahora',
    current: true,
  },
  {
    id: 'session-2',
    device: 'iPhone 15',
    location: 'Safari · Barcelona, España',
    lastActive: 'Hace 2 horas',
    current: false,
  },
  {
    id: 'session-3',
    device: 'PC de escritorio',
    location: 'Edge · Madrid, España',
    lastActive: 'Hace 3 días',
    current: false,
  },
]

export function SecurityTab() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const changePassword = useChangePassword()
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [sessions, setSessions] = useState(MOCK_SESSIONS)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>()

  async function onSubmit(data: ChangePasswordForm) {
    setPasswordError(null)
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      notifySuccess('Contraseña actualizada')
      reset()
    } catch (error) {
      setPasswordError(
        error instanceof ApiError
          ? error.message
          : 'No se pudo cambiar la contraseña. Inténtalo de nuevo.',
      )
    }
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await logout()
      navigate('/login')
    } finally {
      setLoggingOut(false)
    }
  }

  async function handleRevokeSession(sessionId: string) {
    // No real endpoint yet
    setRevokingId(sessionId)
    await new Promise((resolve) => setTimeout(resolve, 400))
    setSessions((current) => current.filter((session) => session.id !== sessionId))
    setRevokingId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <SectionHeader
            icon={<ShieldCheck size={24} aria-hidden="true" />}
            title="Cambiar contraseña"
          />

          <PasswordInput
            label="Contraseña actual"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            registration={register('currentPassword', {
              required: 'Introduce tu contraseña actual',
            })}
          />
          <PasswordInput
            label="Nueva contraseña"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            registration={register('newPassword', {
              required: 'La nueva contraseña es obligatoria',
              minLength: { value: 8, message: 'Debe tener al menos 8 caracteres' },
            })}
          />
          <PasswordInput
            label="Confirmar nueva contraseña"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            registration={register('confirmPassword', {
              required: 'Confirma la nueva contraseña',
              validate: (value) =>
                value === getValues('newPassword') || 'Las contraseñas no coinciden',
            })}
          />

          <div className="flex items-center gap-3 pt-2">
            <SincraButton type="submit" loading={isSubmitting}>
              Guardar contraseña
            </SincraButton>
            {passwordError && <span className="text-sm text-error">{passwordError}</span>}
          </div>
        </form>
      </Card>

      <Card className="flex flex-col gap-8">
        <SectionHeader
          icon={<Monitor size={24} aria-hidden="true" />}
          title="Sesiones activas"
          description="Dispositivos donde tienes la sesión iniciada actualmente."
        />

        <ul className="flex flex-col divide-y divide-neutral-100">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col">
                <span className="flex items-center gap-2 font-medium text-ink">
                  {session.device}
                  {session.current && <Badge color="success">Este dispositivo</Badge>}
                </span>
                <span className="text-sm text-ink-muted">
                  {session.location} · {session.lastActive}
                </span>
              </div>
              {!session.current && (
                <SincraButton
                  variant="text"
                  size="sm"
                  loading={revokingId === session.id}
                  onClick={() => handleRevokeSession(session.id)}
                  className="self-start sm:self-auto"
                >
                  Cerrar sesión
                </SincraButton>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <SectionHeader
          icon={<LogOut size={24} aria-hidden="true" />}
          title="Cerrar sesión"
          description="Cerrarás tu sesión en este dispositivo."
        />
        <SincraButton variant="danger" onClick={handleLogout} loading={loggingOut}>
          Cerrar sesión
        </SincraButton>
      </Card>
    </div>
  )
}
