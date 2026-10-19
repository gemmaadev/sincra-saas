import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Search, User, LogOut, ChevronDown, Menu } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Drawer } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Avatar } from '@/shared/components/avatar'
import { Input } from '@/shared/components/input'
import { ConfirmDeleteModal } from '@/shared/components/modal'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { SidebarContent } from './SidebarContent'

interface MenuItemProps {
  icon: ReactNode
  children: ReactNode
  to?: string
  onClick?: () => void
  danger?: boolean
}

function MenuItem({ icon, children, to, onClick, danger = false }: MenuItemProps) {
  const className = `flex w-full items-center gap-2 px-4 py-2 text-left text-sm! ${
    danger ? 'text-error hover:bg-error/10' : 'text-ink hover:bg-surface-hover'
  }`

  if (to) {
    return (
      <Link to={to} role="menuitem" onClick={onClick} className={className}>
        {icon}
        {children}
      </Link>
    )
  }

  return (
    <button type="button" role="menuitem" onClick={onClick} className={`${className}`}>
      {icon}
      {children}
    </button>
  )
}

export function AppHeader() {
  const { user, logout } = useAuth()
  const { data: profile } = useProfile()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)

  useEffect(() => {
    closeDrawer()
  }, [location.pathname, closeDrawer])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function handleLogoutClick() {
    setOpen(false)
    setIsLogoutConfirmOpen(true)
  }

  async function handleConfirmLogout() {
    setIsLoggingOut(true)
    await logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <header className="flex items-center justify-between border-b border-neutral-100 px-6 py-3 gap-3">
      <button
        type="button"
        onClick={openDrawer}
        aria-label="Abrir menú"
        className="flex shrink-0 items-center justify-center rounded-lg p-2 text-ink-muted hover:bg-surface-hover hover:text-ink md:hidden"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <div className="max-w-2xl flex-1">
        <Input
          placeholder="Buscar conversaciones, clientes, pedidos..."
          icon={<Search size={18} />}
          className="bg-neutral-50"
        />
      </div>
      <div className="relative flex items-center gap-4" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Menú de usuario"
          className="flex items-center gap-2 rounded-full focus:outline-2 focus:outline-primary focus:outline-offset-3 cursor-pointer"
        >
          <Avatar src={profile?.avatarUrl ?? undefined} name={user.name} size="md" />
          <ChevronDown size={16} className="text-ink-muted" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-56 rounded-lg border border-neutral-100 bg-white py-1 shadow-lg"
          >
            <div className="border-b border-neutral-100 px-4 py-2">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-muted">{user.email}</p>
            </div>
            <MenuItem to="/profile" icon={<User size={16} />} onClick={() => setOpen(false)}>
              Mi perfil
            </MenuItem>
            <MenuItem icon={<LogOut size={16} />} onClick={handleLogoutClick} danger>
              Cerrar sesión
            </MenuItem>
          </div>
        )}
      </div>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="left"
        size="18rem"
        padding={0}
        closeButtonProps={{ 'aria-label': 'Cerrar menú' }}
      >
        <SidebarContent />
      </Drawer>

      <ConfirmDeleteModal
        opened={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
        title="¿Cerrar sesión?"
        message="Tendrás que volver a iniciar sesión para acceder a tu cuenta."
        confirmLabel="Cerrar sesión"
      />
    </header>
  )
}
