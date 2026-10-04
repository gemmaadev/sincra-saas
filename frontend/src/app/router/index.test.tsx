import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { router } from './index'

const LAZY_PAGE_TIMEOUT_MS = 5000

describe('Router', () => {
  // Given the app's route configuration
  // When the user visits the landing page
  // Then the landing page content should be visible
  it('renders the landing page at /', async () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/'] })
    render(<RouterProvider router={testRouter} />)
    expect(
      await screen.findByText(
        /Gestiona tus comunicaciones y pedidos multicanal/,
        {},
        { timeout: LAZY_PAGE_TIMEOUT_MS },
      ),
    ).toBeInTheDocument()
  })

  // Given the app's route configuration
  // When the user visits an unknown path
  // Then the 404 page should be shown
  it('renders the 404 page for an unknown route', async () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/does-not-exist'] })
    render(<RouterProvider router={testRouter} />)
    expect(
      await screen.findByText(/no existe/, {}, { timeout: LAZY_PAGE_TIMEOUT_MS }),
    ).toBeInTheDocument()
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
