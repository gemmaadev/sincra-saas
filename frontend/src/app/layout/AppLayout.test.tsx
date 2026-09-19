import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, it, expect } from 'vitest'
import { AppLayout } from './AppLayout'

describe('AppLayout', () => {
  // Given an AppLayout wrapping a protected page
  // When it is rendered
  // Then the sidebar, header and page content should all be present
  it('renders the sidebar, header and the routed page content', () => {
    render(
      <MemoryRouter initialEntries={['/inbox']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/inbox" element={<p>Inbox content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Sincra')).toBeInTheDocument()
    expect(screen.getByText('Inbox content')).toBeInTheDocument()
  })
})
