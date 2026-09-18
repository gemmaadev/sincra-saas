import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/app/layout/AppLayout'
import { SiteLayout } from '@/app/layout/SiteLayout'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { VerifyEmailPage } from '@/pages/VerifyEmailPage'
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
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProtectedRoute } from './ProtectedRoute'

export const router = createBrowserRouter([
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
  { path: '/registro', element: <RegisterPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '/recuperar-contrasena', element: <ForgotPasswordPage /> },
  { path: '/nueva-contrasena', element: <ResetPasswordPage /> },

  // Auth — simple, no side panel
  { path: '/verificar-email', element: <VerifyEmailPage /> },

  // Protected app: requires a session, sidebar + header
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/bandeja', element: <InboxPage /> },
          { path: '/clientes', element: <ClientsPage /> },
          { path: '/pedidos', element: <OrdersPage /> },
          { path: '/calendario', element: <CalendarPage /> },
          { path: '/mapa', element: <MapPage /> },
          { path: '/estadisticas', element: <StatsPage /> },
          { path: '/equipo', element: <TeamPage /> },
          { path: '/automatizaciones', element: <AutomationsPage /> },
          { path: '/ajustes', element: <SettingsPage /> },
          { path: '/perfil', element: <ProfilePage /> },
        ],
      },
    ],
  },
])
