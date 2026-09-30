import { useGoogleLogin } from '@react-oauth/google'
import { MicrosoftIcon } from '@/shared/components/icon/OAuthIcons'
import { FcGoogle } from 'react-icons/fc'
import { useSocialLogin } from '../hooks/useSocialLogin'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function SocialLoginButtons() {
  const { loginWithGoogle, isSubmitting, error, setError } = useSocialLogin()

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: (tokenResponse) => {
      loginWithGoogle(tokenResponse.access_token)
    },
    onError: () => {
      setError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.')
    },
    onNonOAuthError: () => {
      // Popup closed or failed to open — not a real error, don't show a message
    },
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={isSubmitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-sm font-medium disabled:opacity-60"
        >
          <FcGoogle size={18} aria-hidden="true" />
          Google
        </button>

        <a
          href={`${API_BASE_URL}/auth/microsoft/start`}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-sm font-medium"
        >
          <MicrosoftIcon size={18} />
          Microsoft
        </a>
      </div>

      {error && <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}
    </div>
  )
}
