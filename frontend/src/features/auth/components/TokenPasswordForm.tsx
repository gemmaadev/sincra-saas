import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'
import { AuthLayout } from '@/app/layout/AuthLayout'
import { SincraButton } from '@/shared/components/button'
import { SincraLogo } from '@/shared/components/logo'
import { PasswordInput } from '@/shared/components/input'

interface PasswordFormData {
  password: string
  confirmPassword: string
}

interface TokenPasswordFormProps {
  heroTitle: string
  heroDescription: string
  formTitle: string
  formDescription: string
  passwordLabel: string
  submitLabel: string
  submittingLabel: string
  invalidLinkMessage: string
  invalidLinkCtaLabel: string
  invalidLinkCtaTo: string
  isSubmitting: boolean
  error: string | null
  onSubmit: (token: string, password: string) => Promise<void>
}

export function TokenPasswordForm({
  heroTitle,
  heroDescription,
  formTitle,
  formDescription,
  passwordLabel,
  submitLabel,
  submittingLabel,
  invalidLinkMessage,
  invalidLinkCtaLabel,
  invalidLinkCtaTo,
  isSubmitting,
  error,
  onSubmit,
}: TokenPasswordFormProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<PasswordFormData>()

  const handleFormSubmit = async (data: PasswordFormData) => {
    if (!token) return
    await onSubmit(token, data.password)
  }

  if (!token) {
    return (
      <AuthLayout
        leftPanel={
          <div className="flex h-full flex-col justify-center gap-6 bg-primary p-12 text-white">
            <SincraLogo size={28} variant="white" />
            <h2 className="text-3xl font-bold">Enlace no válido</h2>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-ink">Enlace no válido</h1>
          <p className="text-ink-muted">{invalidLinkMessage}</p>
          <SincraButton
            type="button"
            variant="primary"
            onClick={() => navigate(invalidLinkCtaTo)}
          >
            {invalidLinkCtaLabel}
          </SincraButton>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      leftPanel={
        <div className="flex h-full flex-col justify-center gap-6 bg-primary p-12 text-white">
          <SincraLogo size={28} variant="white" />
          <h2 className="text-3xl font-bold">{heroTitle}</h2>
          <p className="text-white/90">{heroDescription}</p>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-ink">{formTitle}</h1>
          <p className="text-ink-muted">{formDescription}</p>
        </div>

        {error && <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-4">
          <PasswordInput
            label={passwordLabel}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            error={errors.password?.message}
            registration={register('password', {
              required: 'La contraseña es obligatoria',
              minLength: { value: 8, message: 'La contraseña debe tener al menos 8 caracteres' },
            })}
          />

          <PasswordInput
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            registration={register('confirmPassword', {
              required: 'Repite tu contraseña',
              validate: (value) =>
                value === getValues('password') || 'Las contraseñas no coinciden',
            })}
          />

          <SincraButton type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </SincraButton>
        </form>
      </div>
    </AuthLayout>
  )
}
