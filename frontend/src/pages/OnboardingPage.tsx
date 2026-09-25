import { useState } from 'react'
import { useNavigate } from 'react-router'
import { SincraLogo } from '@/shared/components/logo'
import { OnboardingStepper } from '@/features/onboarding/components/OnboardingStepper'
import { BusinessStep } from '@/features/onboarding/components/BusinessStep'
import { ChannelsStep } from '@/features/onboarding/components/ChannelsStep'
import { DoneStep } from '@/features/onboarding/components/DoneStep'
import { ONBOARDING_STEPS } from '@/features/onboarding/onboarding.constants'
import type { OnboardingData } from '@/features/onboarding/onboarding.types'
import { LogOut } from 'lucide-react'

const INITIAL_DATA: OnboardingData = {
  businessName: '',
  sector: '',
  description: '',
  country: 'ES',
  connectedChannels: [],
}

const FIRST_STEP = 1
const LAST_STEP = ONBOARDING_STEPS.length

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(FIRST_STEP)
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA)

  const goNext = () => setCurrentStep((step) => Math.min(step + 1, LAST_STEP))
  const goBack = () => setCurrentStep((step) => Math.max(step - 1, FIRST_STEP))

  const updateData = (fields: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...fields }))
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="flex items-center justify-between px-6 py-6">
        <SincraLogo size={24} />
        <button
          type="button"
          onClick={() => navigate('/login')}
          aria-label="Salir del proceso de configuración"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-neutral-100 hover:text-ink"
        >
          Salir
          <LogOut size={16} aria-hidden="true" />
        </button>
      </div>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-8 px-6 pb-10">
        <OnboardingStepper steps={ONBOARDING_STEPS} currentStep={currentStep} />

        {currentStep === 1 && <BusinessStep data={data} onChange={updateData} onNext={goNext} />}
        {currentStep === 2 && <ChannelsStep onBack={goBack} onNext={goNext} />}
        {currentStep === 3 && <DoneStep />}
      </main>
    </div>
  )
}
