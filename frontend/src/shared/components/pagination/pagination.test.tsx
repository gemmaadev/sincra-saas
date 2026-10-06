import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi } from 'vitest'
import { Pagination } from './Pagination'

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>)
}

describe('Pagination', () => {
  // Given a single page of results
  // When Pagination is rendered
  // Then nothing should be shown
  it('renders nothing when there is only one page', () => {
    renderWithMantine(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />)
    expect(screen.queryByText(/Página 1 de/)).not.toBeInTheDocument()
  })

  // Given several pages
  // When Pagination is rendered
  // Then the current page indicator and every page number should be visible
  it('shows the current page indicator and the page number buttons', () => {
    renderWithMantine(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  // Given the first page of several
  // When Pagination is rendered
  // Then "Página anterior" should be disabled and "Página siguiente" should be enabled
  it('disables "Página anterior" on the first page', () => {
    renderWithMantine(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('Página anterior')).toBeDisabled()
    expect(screen.getByLabelText('Página siguiente')).not.toBeDisabled()
  })

  // Given the last page of several
  // When Pagination is rendered
  // Then "Página siguiente" should be disabled and "Página anterior" should be enabled
  it('disables "Página siguiente" on the last page', () => {
    renderWithMantine(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByLabelText('Página siguiente')).toBeDisabled()
    expect(screen.getByLabelText('Página anterior')).not.toBeDisabled()
  })

  // Given a page number button
  // When the user clicks it
  // Then onPageChange should be called with that page number
  it('calls onPageChange with the clicked page number', () => {
    const onPageChange = vi.fn()
    renderWithMantine(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />)
    screen.getByText('3').click()
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  // Given a page in the middle
  // When the user clicks "Página siguiente"
  // Then onPageChange should be called with the next page number
  it('calls onPageChange with the next page when "Página siguiente" is clicked', () => {
    const onPageChange = vi.fn()
    renderWithMantine(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />)
    screen.getByLabelText('Página siguiente').click()
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  // Given a page in the middle
  // When the user clicks "Página anterior"
  // Then onPageChange should be called with the previous page number
  it('calls onPageChange with the previous page when "Página anterior" is clicked', () => {
    const onPageChange = vi.fn()
    renderWithMantine(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />)
    screen.getByLabelText('Página anterior').click()
    expect(onPageChange).toHaveBeenCalledWith(2 - 1)
  })
})
