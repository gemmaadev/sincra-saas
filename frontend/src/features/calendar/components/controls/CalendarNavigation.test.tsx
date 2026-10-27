import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CalendarNavigation } from './CalendarNavigation'

describe('CalendarNavigation', () => {
  // Given the navigation is rendered
  // When the user clicks the previous button
  // Then onPrev should be called
  it('calls onPrev when the previous button is clicked', async () => {
    const user = userEvent.setup()
    const onPrev = vi.fn()
    render(<CalendarNavigation onPrev={onPrev} onNext={vi.fn()} onToday={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Periodo anterior' }))

    expect(onPrev).toHaveBeenCalledOnce()
  })

  // Given the navigation is rendered
  // When the user clicks the next button
  // Then onNext should be called
  it('calls onNext when the next button is clicked', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<CalendarNavigation onPrev={vi.fn()} onNext={onNext} onToday={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Periodo siguiente' }))

    expect(onNext).toHaveBeenCalledOnce()
  })

  // Given the navigation is rendered
  // When the user clicks "Hoy"
  // Then onToday should be called
  it('calls onToday when "Hoy" is clicked', async () => {
    const user = userEvent.setup()
    const onToday = vi.fn()
    render(<CalendarNavigation onPrev={vi.fn()} onNext={vi.fn()} onToday={onToday} />)

    await user.click(screen.getByRole('button', { name: 'Hoy' }))

    expect(onToday).toHaveBeenCalledOnce()
  })
})
