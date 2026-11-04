import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'
import { theme } from '@/shared/config/mantine-theme'
import { queryClient } from '@/shared/config/queryClient'
import { router } from '@/app/router'
import { ErrorBoundary } from '@/app/providers/ErrorBoundary'
import { AuthProvider } from './features/auth/context/AuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MantineProvider theme={theme}>
            <Notifications position="top-right" />
            <RouterProvider router={router} />
          </MantineProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
