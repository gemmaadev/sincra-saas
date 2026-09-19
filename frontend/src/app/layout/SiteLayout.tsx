import { Outlet } from 'react-router'
import { SiteNavbar } from './components/SiteNavbar'

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNavbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Placeholder — replaced with the real <SiteFooter /> later */}
      <footer className="border-t border-neutral-100 p-4 text-sm text-ink-muted">© Sincra</footer>
    </div>
  )
}
