import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/app/layout/AppLayout'
import { SiteLayout } from '@/app/layout/SiteLayout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import OnboardingPage from '@/pages/OnboardingPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { VerifyEmailPage } from '@/pages/VerifyEmailPage'
import { SelectBusinessPage } from '@/pages/SelectBusinessPage'
import { InboxPage } from '@/pages/InboxPage'
import { ClientsPage } from '@/pages/ClientsPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { MapPage } from '@/pages/MapPage'
import { StatsPage } from '@/pages/StatsPage'
import { TeamPage } from '@/pages/TeamPage'
import { AutomationsPage } from '@/pages/AutomationsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'
import { ProtectedRoute } from './ProtectedRoute'
import { ErrorFallback } from '../../shared/components/error-fallback/ErrorFallback'

export const router = createBrowserRouter([
  {
    errorElement: <ErrorFallback />,
    children: [
      // Public site: navbar + footer (Landing and 404 share this shell)
      {
        element: <SiteLayout />,
        children: [
          { path: '/', element: <LandingPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },

      // Auth — split screen: each page mounts its own <AuthLayout leftPanel={...}>
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/onboarding', element: <OnboardingPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },

      // Auth — simple, no side panel
      { path: '/verify-email', element: <VerifyEmailPage /> },
      { path: '/select-business', element: <SelectBusinessPage /> },

      // Protected app: requires a session, sidebar + header
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/inbox', element: <InboxPage /> },
              { path: '/clients', element: <ClientsPage /> },
              { path: '/orders', element: <OrdersPage /> },
              { path: '/calendar', element: <CalendarPage /> },
              { path: '/map', element: <MapPage /> },
              { path: '/stats', element: <StatsPage /> },
              { path: '/team', element: <TeamPage /> },
              { path: '/automations', element: <AutomationsPage /> },
              { path: '/settings', element: <SettingsPage /> },
              { path: '/profile', element: <ProfilePage /> },
            ],
          },
        ],
      },
    ],
  },
])
