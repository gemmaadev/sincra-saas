import { Outlet } from 'react-router'
import { SiteNavbar } from './components/SiteNavbar'
import { SiteFooter } from './components/SiteFooter'

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNavbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}
