import { Outlet } from 'react-router'

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Placeholder — replaced with the real <Navbar /> later */}
      <header className="border-b border-neutral-100 p-4">
        <span className="text-lg font-bold text-primary">Sincra</span>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Placeholder — replaced with the real <Footer /> later */}
      <footer className="border-t border-neutral-100 p-4 text-sm text-ink-muted">© Sincra</footer>
    </div>
  )
}
