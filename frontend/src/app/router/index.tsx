import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/app/layout/AppLayout'
import { SiteLayout } from '@/app/layout/SiteLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { ErrorFallback } from '../../shared/components/error-fallback/ErrorFallback'

type PageModule = { default: ComponentType }

function lazyPage(loadPage: () => Promise<PageModule>) {
  return {
    lazy: async () => ({ Component: (await loadPage()).default }),
  }
}

export const router = createBrowserRouter([
  {
    errorElement: <ErrorFallback />,
    hydrateFallbackElement: <p className="p-6 text-ink-muted">Cargando...</p>,
    children: [
      // Public site: navbar + footer (Landing and 404 share this shell)
      {
        element: <SiteLayout />,
        children: [
          {
            path: '/',
            ...lazyPage(() => import('@/pages/LandingPage')),
          },
          {
            path: '*',
            ...lazyPage(() => import('@/pages/NotFoundPage')),
          },
        ],
      },

      // Auth — split screen: each page mounts its own <AuthLayout leftPanel={...}>
      {
        path: '/login',
        ...lazyPage(() => import('@/pages/LoginPage')),
      },
      {
        path: '/register',
        ...lazyPage(() => import('@/pages/RegisterPage')),
      },
      {
        path: '/onboarding',
        ...lazyPage(() => import('@/pages/OnboardingPage')),
      },
      {
        path: '/forgot-password',
        ...lazyPage(() => import('@/pages/ForgotPasswordPage')),
      },
      {
        path: '/reset-password',
        ...lazyPage(() => import('@/pages/ResetPasswordPage')),
      },
      {
        path: '/accept-invite',
        ...lazyPage(() => import('@/pages/AcceptInvitePage')),
      },

      // Auth — simple, no side panel
      {
        path: '/verify-email',
        ...lazyPage(() => import('@/pages/VerifyEmailPage')),
      },
      {
        path: '/select-business',
        ...lazyPage(() => import('@/pages/SelectBusinessPage')),
      },

      // Protected app: requires a session, sidebar + header
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: '/inbox',
                ...lazyPage(() => import('@/pages/InboxPage')),
              },
              {
                // ClientsPage renders the detail Drawer itself (via useMatch), so this
                // only exists to make /clients/:id a valid, non-404 URL.
                path: '/clients',
                ...lazyPage(() => import('@/pages/ClientsPage')),
                children: [{ path: ':id' }],
              },
              {
                path: '/orders',
                ...lazyPage(() => import('@/pages/OrdersPage')),
              },
              {
                path: '/calendar',
                ...lazyPage(() => import('@/pages/CalendarPage')),
              },
              {
                path: '/map',
                ...lazyPage(() => import('@/pages/MapPage')),
              },
              {
                path: '/stats',
                ...lazyPage(() => import('@/pages/StatsPage')),
              },
              {
                path: '/team',
                ...lazyPage(() => import('@/pages/TeamPage')),
              },
              {
                path: '/automations',
                ...lazyPage(() => import('@/pages/AutomationsPage')),
              },
              {
                path: '/settings',
                ...lazyPage(() => import('@/pages/SettingsPage')),
              },
              {
                path: '/profile',
                ...lazyPage(() => import('@/pages/ProfilePage')),
              },
            ],
          },
        ],
      },
    ],
  },
])
