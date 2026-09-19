import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { router } from './index'

describe('Router', () => {
  it('renders the landing page at /', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/'] })
    render(<RouterProvider router={testRouter} />)
    expect(screen.getByText('Landing page')).toBeInTheDocument()
  })

  it('renders the 404 page for an unknown route', () => {
    const testRouter = createMemoryRouter(router.routes, { initialEntries: ['/does-not-exist'] })
    render(<RouterProvider router={testRouter} />)
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument()
  })
})
