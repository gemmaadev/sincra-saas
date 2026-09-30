import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Menu, X } from 'lucide-react'
import { SincraButton } from '@/shared/components/button'
import { SincraLogo } from '@/shared/components/logo'

const navLinks = [
  { href: '#product', label: 'Producto' },
  { href: '#channels', label: 'Canales' },
  { href: '#features', label: 'Funcionalidades' },
  { href: '#pricing', label: 'Precios' },
  { href: '#contact', label: 'Contacto' },
]

export function SiteNavbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className="border-b border-neutral-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/">
          <SincraLogo size={28} />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-base font-medium text-ink-muted hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link to="/login" className="text-base font-medium text-ink-muted hover:text-ink">
            Iniciar sesión
          </Link>
          <SincraButton variant="primary" onClick={() => navigate('/register')}>
            Registrarse
          </SincraButton>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="mt-4 flex flex-col gap-3 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-base font-medium text-ink-muted"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <Link
              to="/login"
              className="flex items-center justify-center rounded-lg border border-primary px-4 py-2 text-base font-medium text-primary"
            >
              Iniciar sesión
            </Link>
            <SincraButton variant="primary" onClick={() => navigate('/register')}>
              Registrarse
            </SincraButton>
          </div>
        </div>
      )}
    </nav>
  )
}
