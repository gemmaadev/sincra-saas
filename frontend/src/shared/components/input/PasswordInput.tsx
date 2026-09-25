import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { Input } from './Input'

interface PasswordInputProps {
  label?: string
  placeholder?: string
  error?: string
  registration: UseFormRegisterReturn
}

export function PasswordInput({ label, placeholder, error, registration }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        label={label}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        error={error}
        className="pr-9"
        {...registration}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-9.5 text-ink-muted"
        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
