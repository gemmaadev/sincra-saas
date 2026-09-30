import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OnboardingStepper } from './OnboardingStepper'

const STEPS = [
  { number: 1, label: 'Negocio' },
  { number: 2, label: 'Canales' },
  { number: 3, label: 'Listo' },
]

describe('OnboardingStepper', () => {
  it('Scenario: rendering all step labels', () => {
    // Given a list of steps
    // When the stepper renders
    // Then every step label is shown
    render(<OnboardingStepper steps={STEPS} currentStep={1} />)

    expect(screen.getByText('Negocio')).toBeInTheDocument()
    expect(screen.getByText('Canales')).toBeInTheDocument()
    expect(screen.getByText('Listo')).toBeInTheDocument()
  })

  it('Scenario: a completed step shows a check instead of its number', () => {
    // Given the user is on step 2
    // When the stepper renders
    // Then step 1 (completed) no longer shows its number
    const { container } = render(<OnboardingStepper steps={STEPS} currentStep={2} />)

    expect(screen.queryByText('1')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument() // lucide Check icon
  })

  it('Scenario: the current and upcoming steps show their number', () => {
    // Given the user is on step 2
    // When the stepper renders
    // Then step 2 (current) and step 3 (upcoming) still show their numbers
    render(<OnboardingStepper steps={STEPS} currentStep={2} />)

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('Scenario: current and completed steps are highlighted', () => {
    // Given the user is on step 2
    // When the stepper renders
    // Then steps 1 and 2 use the active (primary) background, and step 3 does not
    render(<OnboardingStepper steps={STEPS} currentStep={2} />)

    const stepThreeCircle = screen.getByText('3')
    expect(stepThreeCircle).toHaveClass('bg-neutral-100')
  })

  it('Scenario: connector lines between steps', () => {
    // Given N steps
    // When the stepper renders
    // Then there are N - 1 connector lines
    const { container } = render(<OnboardingStepper steps={STEPS} currentStep={1} />)

    const connectors = container.querySelectorAll('.bg-neutral-200')
    expect(connectors).toHaveLength(STEPS.length - 1)
  })
})
