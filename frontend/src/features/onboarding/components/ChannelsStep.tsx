import { SincraButton } from '@/shared/components/button'

interface ChannelsStepProps {
  onBack: () => void
  onNext: () => void
}

export function ChannelsStep({ onBack, onNext }: ChannelsStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">Conecta tus canales</h1>
        <p className="text-ink-muted">
          Integra tus cuentas para recibir y gestionar todas tus comunicaciones en un solo lugar.
        </p>
      </div>
      <div className="flex justify-between">
        <SincraButton variant="secondary" onClick={onBack}>
          ← Volver
        </SincraButton>
        <SincraButton variant="primary" onClick={onNext}>
          Siguiente →
        </SincraButton>
      </div>
    </div>
  )
}
