import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { router } from './index'

describe('Router', () => {
  // Given the app's route configuration
  // When the user visits the landing page
  // Then the landing page content should be visible
  it('renders the landing page at /', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/'] })
    render(<RouterProvider router={testRouter} />)
    expect(screen.getByText('Landing page')).toBeInTheDocument()
  })

  // Given the app's route configuration
  // When the user visits an unknown path
  // Then the 404 page should be shown
  it('renders the 404 page for an unknown route', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/does-not-exist'] })
    render(<RouterProvider router={testRouter} />)
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument()
  })

  // Given a route that throws an error during render
  // When the user navigates to it
  // Then the ErrorFallback should be shown instead of crashing the app
  it('renders the ErrorFallback when a route throws', () => {
    const BrokenComponent = () => {
      throw new Error('Test error')
    }
    const testRouter = createMemoryRouter(
      [{ path: '/', element: <BrokenComponent />, errorElement: <div>Algo salió mal</div> }],
      { initialEntries: ['/'] },
    )
    render(<RouterProvider router={testRouter} />)
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
  })
})
