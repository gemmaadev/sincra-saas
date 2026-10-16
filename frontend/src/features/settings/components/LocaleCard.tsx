import { Clock } from 'lucide-react'
import { Select } from '@/shared/components'
import { notifySuccess } from '@/shared/utils/notify'
import { TIMEZONE_OPTIONS, LANGUAGE_OPTIONS } from '../settings.constants'
import { useUpdateBusinessSettings } from '../hooks/useUpdateBusinessSettings'
import { SectionHeader } from './SectionHeader'
import type { BusinessSettings } from '../types/settings.types'

interface LocaleCardProps {
  business: BusinessSettings
  canEdit: boolean
}

export function LocaleCard({ business, canEdit }: LocaleCardProps) {
  const updateBusinessSettings = useUpdateBusinessSettings()

  function handleTimezoneChange(timezone: string) {
    updateBusinessSettings.mutate(
      { timezone },
      { onSuccess: () => notifySuccess('Cambios guardados') },
    )
  }

  function handleLanguageChange(language: string) {
    updateBusinessSettings.mutate(
      { language },
      { onSuccess: () => notifySuccess('Cambios guardados') },
    )
  }

  return (
    <section
      aria-label="Zona horaria e idioma"
      className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0"
    >
      <SectionHeader
        icon={<Clock size={24} aria-hidden="true" />}
        title="Zona horaria e idioma"
        description="Configura la zona horaria y el idioma de la plataforma."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          id="business-timezone"
          label="Zona horaria"
          options={TIMEZONE_OPTIONS}
          value={business.timezone}
          disabled={!canEdit || updateBusinessSettings.isPending}
          onChange={(event) => handleTimezoneChange(event.target.value)}
        />
        <Select
          id="business-language"
          label="Idioma"
          options={LANGUAGE_OPTIONS}
          value={business.language}
          disabled={!canEdit || updateBusinessSettings.isPending}
          onChange={(event) => handleLanguageChange(event.target.value)}
        />
      </div>
    </section>
  )
}
