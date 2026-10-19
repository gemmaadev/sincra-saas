import { SidebarContent } from './SidebarContent'

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-neutral-100 bg-surface-sidebar max-md:hidden">
      <SidebarContent />
    </aside>
  )
}
