// app/layout/SiteLayout.tsx
import { Outlet } from 'react-router'

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Placeholder — se sustituye por <Navbar /> real en la tarjeta de Landing */}
      <header className="border-b border-neutral-100 p-4">
        <span className="text-lg font-bold text-primary">Sincra</span>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Placeholder — se sustituye por <Footer /> real en la tarjeta de Landing */}
      <footer className="border-t border-neutral-100 p-4 text-sm text-ink-muted">© Sincra</footer>
    </div>
  )
}
