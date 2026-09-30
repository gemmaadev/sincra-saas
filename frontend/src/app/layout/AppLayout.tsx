import { Outlet } from 'react-router'
import { Sidebar } from './components/Sidebar'
import { AppHeader } from './components/AppHeader'

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
