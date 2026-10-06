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

  // Given a tab marked as disabled
  // When Tabs is rendered
  // Then that tab button should be disabled
  it('disables a tab marked as disabled', () => {
    const tabsWithDisabled = [
      ...tabs,
      { key: 'pedidos', label: 'Pedidos', content: <p>Contenido de pedidos</p>, disabled: true },
    ]
    render(<Tabs tabs={tabsWithDisabled} />)
    expect(screen.getByRole('tab', { name: 'Pedidos' })).toBeDisabled()
  })

  // Given a disabled tab
  // When the user clicks it
  // Then its content should not be shown
  it('does not switch to a disabled tab when clicked', () => {
    const tabsWithDisabled = [
      ...tabs,
      { key: 'pedidos', label: 'Pedidos', content: <p>Contenido de pedidos</p>, disabled: true },
    ]
    render(<Tabs tabs={tabsWithDisabled} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Pedidos' }))
    expect(screen.queryByText('Contenido de pedidos')).not.toBeInTheDocument()
    expect(screen.getByText('Contenido de resumen')).toBeInTheDocument()
  })

  // Given the first tab is disabled
  // When Tabs is rendered with no defaultTab
  // Then it should default to the first tab that isn't disabled
  it('defaults to the first non-disabled tab', () => {
    const tabsWithFirstDisabled = [
      { key: 'historial', label: 'Historial', content: <p>Contenido de historial</p>, disabled: true },
      { key: 'resumen', label: 'Resumen', content: <p>Contenido de resumen</p> },
    ]
    render(<Tabs tabs={tabsWithFirstDisabled} />)
    expect(screen.getByText('Contenido de resumen')).toBeInTheDocument()
  })
})
