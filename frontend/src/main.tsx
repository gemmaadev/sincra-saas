import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import './index.css'
import { theme } from '@/shared/config/mantine-theme'
import { router } from '@/app/router'
import { ErrorBoundary } from '@/app/providers/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <MantineProvider theme={theme}>
        <RouterProvider router={router} />
      </MantineProvider>
    </ErrorBoundary>
  </StrictMode>,
)
