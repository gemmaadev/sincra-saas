import { Select } from '@/shared/components'
import { CHANNEL_BRANDS } from './channels'

const CHANNEL_OPTIONS = CHANNEL_BRANDS.map((brand) => ({
  value: brand.id.toUpperCase(),
  label: brand.name,
}))

interface ChannelSelectProps {
  id: string
  value: string
  onChange: (value: string) => void
  size?: 'sm' | 'md'
}

export function ChannelSelect({ id, value, onChange, size }: ChannelSelectProps) {
  return (
    <Select
      id={id}
      label="Canal"
      placeholder="Todos"
      options={CHANNEL_OPTIONS}
      size={size}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
