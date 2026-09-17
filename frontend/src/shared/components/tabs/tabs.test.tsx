import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Tabs } from './Tabs'

const tabs = [
  { key: 'resumen', label: 'Resumen', content: <p>Contenido de resumen</p> },
  { key: 'historial', label: 'Historial', content: <p>Contenido de historial</p> },
]

describe('Tabs', () => {
  // Given a Tabs component with no defaultTab specified
  // When it is rendered
  // Then the content of the first tab should be shown by default
  it('shows the first tab content by default', () => {
    render(<Tabs tabs={tabs} />)
    expect(screen.getByText('Contenido de resumen')).toBeInTheDocument()
    expect(screen.queryByText('Contenido de historial')).not.toBeInTheDocument()
  })

  // Given a Tabs component
  // When the user clicks on a different tab
  // Then that tab's content should be shown instead
  it('switches content when a different tab is clicked', () => {
    render(<Tabs tabs={tabs} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Historial' }))
    expect(screen.getByText('Contenido de historial')).toBeInTheDocument()
    expect(screen.queryByText('Contenido de resumen')).not.toBeInTheDocument()
  })

  // Given a Tabs component with a defaultTab explicitly set
  // When it is rendered
  // Then that tab's content should be shown from the start
  it('respects the defaultTab prop', () => {
    render(<Tabs tabs={tabs} defaultTab="historial" />)
    expect(screen.getByText('Contenido de historial')).toBeInTheDocument()
  })

  // Given a Tabs component
  // When it is rendered
  // Then the active tab should be marked as selected for accessibility
  it('marks the active tab with aria-selected', () => {
    render(<Tabs tabs={tabs} />)
    expect(screen.getByRole('tab', { name: 'Resumen' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Historial' })).toHaveAttribute('aria-selected', 'false')
  })
})
