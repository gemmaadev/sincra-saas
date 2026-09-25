import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Store, MessageSquare, Sparkles } from 'lucide-react'
import { SincraButton } from '@/shared/components/button'
import { TOTAL_CHANNELS_COUNT } from '../onboarding.constants'
import type { OnboardingData } from '../onboarding.types'

interface DoneStepProps {
  data: OnboardingData
}

export function DoneStep({ data }: DoneStepProps) {
  const navigate = useNavigate()

  return (
    <div className="flex w-full flex-col items-center gap-6 text-center">
      <div className="flex flex-w-full max-w-md">
        <img
          src="/onboarding-step-3.png"
          alt="Ilustración de un gato durmiendo sobre un sobre de correo, con un avión de papel volando"
          className="w-full max-w-lg"
          width={30}
        />
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">¡Todo listo!</h1>
        <p className="text-ink-muted">
          Tu negocio ya está configurado y listo para empezar a gestionar tus comunicaciones en
          Sincra.
        </p>
      </div>

      <div className="flex w-full flex-col divide-y divide-neutral-100 rounded-xl border border-neutral-100 bg-white">
        <SummaryRow icon={<Store size={23} />} label="Negocio" value={data.businessName} />
        <SummaryRow
          icon={<MessageSquare size={23} />}
          label="Canales conectados"
          value={`${data.connectedChannels.length} de ${TOTAL_CHANNELS_COUNT}`}
        />
        <SummaryRow
          icon={<Sparkles size={23} />}
          label="Agentes de IA"
          value="Activos"
          actionLabel="Configurar"
          onAction={() => navigate('/automations')}
        />
      </div>

      <SincraButton variant="primary" onClick={() => navigate('/inbox')}>
        Ir al panel principal
      </SincraButton>
    </div>
  )
}

interface SummaryRowProps {
  icon: ReactNode
  label: string
  value: string
  actionLabel?: string
  onAction?: () => void
}

function SummaryRow({ icon, label, value, actionLabel, onAction }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg text-primary">
          {icon}
        </span>

        <div className="flex flex-col text-left">
          <span className="text-sm text-ink-muted">{label}</span>
          <span className="font-medium text-ink">{value}</span>
        </div>
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-medium text-primary cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
