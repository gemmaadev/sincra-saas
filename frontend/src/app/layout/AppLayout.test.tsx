import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, it, expect } from 'vitest'
import { AppLayout } from './AppLayout'
import { AuthContext } from '@/features/auth/context/AuthContext'
import type { AuthContextValue } from '@/features/auth/context/AuthContext'

const authValue: AuthContextValue = {
  user: { id: '1', name: 'Laura García', email: 'laura@tienda.com', role: 'admin' },
  business: { id: 'biz-1', name: 'Tienda de Laura' },
  isAuthenticated: true,
  loading: false,
  login: async () => {},
  logout: async () => {},
}

describe('AppLayout', () => {
  // Given an AppLayout wrapping a protected page
  // When it is rendered
  // Then the sidebar, header and page content should all be present
  it('renders the sidebar, header and the routed page content', () => {
    render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/inbox']}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/inbox" element={<p>Inbox content</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )
    expect(screen.getByText('Sincra')).toBeInTheDocument()
    expect(screen.getByText('Inbox content')).toBeInTheDocument()
  })
})
