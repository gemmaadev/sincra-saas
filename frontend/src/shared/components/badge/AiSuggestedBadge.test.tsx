import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect } from 'vitest'
import { AiSuggestedBadge } from './AiSuggestedBadge'

describe('AiSuggestedBadge', () => {
  // Given something suggested by the AI
  // When the badge is rendered
  // Then it should say so in text
  it('shows the "Sugerido por IA" label on a tag chip', () => {
    render(
      <MantineProvider>
        <AiSuggestedBadge />
      </MantineProvider>,
    )

    const chip = screen.getByText('Sugerido por IA')
    expect(chip).toHaveClass('rounded-full', 'text-sm')
    expect(chip).toHaveStyle({ color: '#1e5eff' })
    expect(chip).toContainElement(screen.getByRole('img', { name: 'Sugerido por IA' }))
  })

  // Given a tag that needs a smaller mark
  // When the compact badge is rendered
  // Then it should expose the same label without printing the full sentence
  it('exposes the label on the compact mark', () => {
    render(
      <MantineProvider>
        <AiSuggestedBadge compact />
      </MantineProvider>,
    )

    expect(screen.getByRole('img', { name: 'Sugerido por IA' })).toBeInTheDocument()
    expect(screen.queryByText('Sugerido por IA')).not.toBeInTheDocument()
  })

  // Given the compact mark
  // When the pointer rests on it
  // Then the tooltip should spell out "Sugerido por IA"
  it('explains the compact mark in a tooltip', async () => {
    const user = userEvent.setup()
    render(
      <MantineProvider>
        <AiSuggestedBadge compact />
      </MantineProvider>,
    )

    await user.hover(screen.getByRole('img', { name: 'Sugerido por IA' }))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Sugerido por IA')
  })
})
