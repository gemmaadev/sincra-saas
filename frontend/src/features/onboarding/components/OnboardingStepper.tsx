import { Check } from 'lucide-react'

interface Step {
  number: number
  label: string
}

interface OnboardingStepperProps {
  steps: Step[]
  currentStep: number
}

export function OnboardingStepper({ steps, currentStep }: OnboardingStepperProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.number} className="contents">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
                step.number <= currentStep
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-ink-muted'
              }`}
            >
              {step.number < currentStep ? <Check size={16} /> : step.number}
            </span>
            {index < steps.length - 1 && <div className="h-px flex-1 bg-neutral-200" />}
          </div>
        ))}
      </div>

      <div className="flex items-start">
        {steps.map((step, index) => (
          <div key={step.number} className="contents">
            <span className="w-10 shrink-0 text-center text-xs font-medium text-ink-muted">
              {step.label}
            </span>
            {index < steps.length - 1 && <div className="flex-1" />}
          </div>
        ))}
      </div>
    </div>
  )
}
