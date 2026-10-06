import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

const selectSizes = {
  sm: 'py-1',
  md: 'py-2',
} as const

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  id: string
  label: string
  options: SelectOption[]
  placeholder?: string
  size?: 'sm' | 'md'
}

export function Select({ id, label, options, placeholder, size = 'md', ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={`w-full appearance-none rounded-lg border border-neutral-200 px-3 pr-9 text-ink ${selectSizes[size]}`}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
      </div>
    </div>
  )
}
