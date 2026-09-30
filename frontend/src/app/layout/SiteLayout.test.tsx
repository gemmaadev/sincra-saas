import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, it, expect } from 'vitest'
import { SiteLayout } from './SiteLayout'

describe('SiteLayout', () => {
  // Given a SiteLayout wrapping a page via Outlet
  // When it is rendered
  // Then the page content should appear inside the shell, alongside the navbar and footer
  it('renders its child route content', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<p>Page content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Page content')).toBeInTheDocument()
    expect(screen.getAllByText('Sincra').length).toBeGreaterThan(0)
  })
})
