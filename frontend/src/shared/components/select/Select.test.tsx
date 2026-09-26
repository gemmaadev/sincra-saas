import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from './Select'

const OPTIONS = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
]

describe('Select', () => {
  it('Scenario: rendering the label and options', () => {
    // Given a label and a list of options
    // When the select renders
    // Then the label and every option are present in the document
    render(<Select id="test-select" label="Sector" options={OPTIONS} value="" onChange={vi.fn()} />)

    expect(screen.getByText('Sector')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument()
  })

  it('Scenario: rendering a placeholder', () => {
    // Given a placeholder is provided
    // When the select renders
    // Then the placeholder appears as the first, empty-value option
    render(
      <Select
        id="test-select"
        label="Sector"
        options={OPTIONS}
        placeholder="Selecciona un sector"
        value=""
        onChange={vi.fn()}
      />,
    )

    const placeholderOption = screen.getByRole('option', { name: 'Selecciona un sector' })
    expect(placeholderOption).toBeInTheDocument()
    expect((placeholderOption as HTMLOptionElement).value).toBe('')
  })

  it('Scenario: selecting an option', async () => {
    // Given a rendered select with no value chosen yet
    // When the user picks an option
    // Then onChange fires with the native change event
    const user = userEvent.setup()
    let receivedValue: string | undefined
    const handleChange = vi.fn((event: React.ChangeEvent<HTMLSelectElement>) => {
      receivedValue = event.target.value
    })

    render(
      <Select id="test-select" label="Sector" options={OPTIONS} value="" onChange={handleChange} />,
    )

    await user.selectOptions(screen.getByLabelText('Sector'), 'b')

    expect(handleChange).toHaveBeenCalledOnce()
    expect(receivedValue).toBe('b')
  })

  it('Scenario: reflecting the current value', () => {
    // Given a value already selected
    // When the select renders
    // Then that option is the one shown as selected
    render(
      <Select id="test-select" label="Sector" options={OPTIONS} value="b" onChange={vi.fn()} />,
    )

    expect(screen.getByLabelText('Sector')).toHaveValue('b')
  })
})
