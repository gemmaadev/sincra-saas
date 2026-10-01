import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import './index.css'
import { theme } from '@/shared/config/mantine-theme'
import { queryClient } from '@/shared/config/queryClient'
import { router } from '@/app/router'
import { ErrorBoundary } from '@/app/providers/ErrorBoundary'
import { AuthProvider } from './features/auth/context/AuthProvider'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <MantineProvider theme={theme}>
              <RouterProvider router={router} />
            </MantineProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
