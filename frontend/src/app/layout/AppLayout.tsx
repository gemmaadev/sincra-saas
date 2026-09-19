import { Outlet } from 'react-router'
import { Sidebar } from './components/Sidebar'
import { HeaderApp } from './components/HeaderApp'

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <HeaderApp />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
