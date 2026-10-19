import { Input } from '@/shared/components/input'
import { Select } from '@/shared/components/select'
import { SincraButton } from '@/shared/components/button'
import { COUNTRY_OPTIONS, DESCRIPTION_MAX_LENGTH } from '../onboarding.constants'
import { SECTOR_OPTIONS } from '@/shared/sectorOptions.constants'
import type { OnboardingData } from '../onboarding.types'

interface BusinessStepProps {
  data: OnboardingData
  onChange: (fields: Partial<OnboardingData>) => void
  onNext: () => void
  isSubmitting?: boolean
  error?: string | null
}

export function BusinessStep({
  data,
  onChange,
  onNext,
  isSubmitting = false,
  error = null,
}: BusinessStepProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onNext()
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">Configuración del negocio</h1>
        <p className="text-ink-muted">
          Vamos a configurar tu negocio para que puedas empezar a recibir y gestionar tus
          comunicaciones.
        </p>
      </div>

      <Input
        label="Nombre del negocio"
        placeholder="Ej. Flowers & Co"
        value={data.businessName}
        onChange={(event) => onChange({ businessName: event.target.value })}
      />

      <Select
        id="sector"
        label="Sector"
        placeholder="Selecciona un sector"
        options={SECTOR_OPTIONS}
        value={data.sector}
        onChange={(event) => onChange({ sector: event.target.value })}
      />

      <Select
        id="country"
        label="¿En qué país estás?"
        options={COUNTRY_OPTIONS}
        value={data.country}
        onChange={(event) => onChange({ country: event.target.value })}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="font-medium text-ink">
          Descripción (opcional)
        </label>
        <textarea
          id="description"
          maxLength={DESCRIPTION_MAX_LENGTH}
          placeholder="Cuéntanos un poco sobre tu negocio..."
          value={data.description}
          onChange={(event) => onChange({ description: event.target.value })}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-ink"
          rows={3}
        />
        <span className="self-end text-xs text-ink-muted">
          {data.description.length}/{DESCRIPTION_MAX_LENGTH}
        </span>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <SincraButton type="submit" variant="primary" disabled={!data.businessName || isSubmitting}>
        {isSubmitting ? 'Creando tu cuenta...' : 'Siguiente →'}
      </SincraButton>
    </form>
  )
}
