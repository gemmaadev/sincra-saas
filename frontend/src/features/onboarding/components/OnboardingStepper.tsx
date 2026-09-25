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
    <div className="flex w-full items-start">
      {steps.map((step, index) => (
        <div key={step.number} className="contents">
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <span
              className={`flex size-10 items-center justify-center rounded-full text-base font-semibold ${
                step.number <= currentStep
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-ink-muted'
              }`}
            >
              {step.number < currentStep ? <Check size={16} /> : step.number}
            </span>
            <span className="text-xs font-medium text-ink-muted">{step.label}</span>
          </div>
          {index < steps.length - 1 && <div className="mt-5 h-px flex-1 bg-neutral-200" />}
        </div>
      ))}
    </div>
  )
}
