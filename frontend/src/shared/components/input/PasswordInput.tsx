import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { Input } from './Input'

interface PasswordInputProps {
  label?: string
  placeholder?: string
  error?: string
  autoComplete?: string
  registration: UseFormRegisterReturn
}

export function PasswordInput({
  label,
  placeholder,
  error,
  autoComplete,
  registration,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Input
      label={label}
      type={showPassword ? 'text' : 'password'}
      placeholder={placeholder}
      error={error}
      autoComplete={autoComplete}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="flex items-center p-1 -m-1"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
      {...registration}
    />
  )
}
