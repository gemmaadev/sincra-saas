import { useState } from 'react'
import { useNavigate } from 'react-router'
import { OnboardingStepper } from '@/features/onboarding/components/OnboardingStepper'
import { BusinessStep } from '@/features/onboarding/components/BusinessStep'
import { ChannelsStep } from '@/features/onboarding/components/ChannelsStep'
import { DoneStep } from '@/features/onboarding/components/DoneStep'
import { ONBOARDING_STEPS } from '@/features/onboarding/onboarding.constants'
import { useRegisterBusiness } from '@/features/auth/hooks/useRegisterBusiness'
import type { OnboardingData } from '@/features/onboarding/onboarding.types'
import { ExitHeader } from '@/shared/components/exit-header/ExitHeader'

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
  const { registerBusiness, isSubmitting, error } = useRegisterBusiness()

  const goNext = () => setCurrentStep((step) => Math.min(step + 1, LAST_STEP))
  const goBack = () => setCurrentStep((step) => Math.max(step - 1, FIRST_STEP))

  const updateData = (fields: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...fields }))
  }

  const handleBusinessStepNext = async () => {
    const success = await registerBusiness(data)
    if (success) goNext()
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <ExitHeader
        ariaLabel="Salir del proceso de configuración"
        onExit={() => navigate('/login')}
      />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-8 px-6 pb-10">
        <OnboardingStepper steps={ONBOARDING_STEPS} currentStep={currentStep} />

        {currentStep === 1 && (
          <BusinessStep
            data={data}
            onChange={updateData}
            onNext={handleBusinessStepNext}
            isSubmitting={isSubmitting}
            error={error}
          />
        )}
        {currentStep === 2 && (
          <ChannelsStep
            connectedChannels={data.connectedChannels}
            onChange={(connectedChannels) => updateData({ connectedChannels })}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {currentStep === 3 && <DoneStep data={data} />}
      </main>
    </div>
  )
}
