import { GoogleLogin } from '@react-oauth/google'
import { MicrosoftIcon } from '@/shared/components/icon/OAuthIcons'
import { FcGoogle } from 'react-icons/fc'
import { useSocialLogin } from '../hooks/useSocialLogin'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function SocialLoginButtons() {
  const { loginWithGoogle } = useSocialLogin()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <div className="relative flex flex-1">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-sm font-medium">
            <FcGoogle size={18} aria-hidden="true" />
            Google
          </button>
          <div className="absolute inset-0 overflow-hidden rounded-lg opacity-0">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  loginWithGoogle(credentialResponse.credential)
                }
              }}
              onError={() => {}}
              auto_select={false}
              width="320"
            />
          </div>
        </div>

        <a
          href={`${API_BASE_URL}/auth/microsoft/start`}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-sm font-medium"
        >
          <MicrosoftIcon size={18} />
          Microsoft
        </a>
      </div>
    </div>
  )
}
