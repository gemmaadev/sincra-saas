import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Search, User, LogOut, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Avatar } from '@/shared/components/avatar'
import { Input } from '@/shared/components/input'
import { useAuth } from '@/features/auth/hooks/useAuth'

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
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <header className="flex items-center justify-between border-b border-neutral-100 px-6 py-3 gap-3">
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
          <Avatar name={user.name} size="md" />
          <ChevronDown size={16} className="text-ink-muted" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+0.5rem)] w-56 rounded-lg border border-neutral-100 bg-surface-card py-1 shadow-lg"
          >
            <div className="border-b border-neutral-100 px-4 py-2">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-muted">{user.email}</p>
            </div>
            <MenuItem to="/profile" icon={<User size={16} />} onClick={() => setOpen(false)}>
              Mi perfil
            </MenuItem>
            <MenuItem icon={<LogOut size={16} />} onClick={handleLogout} danger>
              Cerrar sesión
            </MenuItem>
          </div>
        )}
      </div>
    </header>
  )
}
