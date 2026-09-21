import { SiFacebook, SiInstagram } from 'react-icons/si'
import { SlSocialLinkedin } from 'react-icons/sl'

const footerColumns = [
  {
    title: 'Producto',
    links: ['Características', 'Precios', 'Integraciones', 'Seguridad'],
  },
  {
    title: 'Recursos',
    links: ['Centro de ayuda', 'Blog', 'Casos de éxito', 'Novedades'],
  },
  {
    title: 'Empresa',
    links: ['Sobre nosotros', 'Contacto'],
  },
]

const legalLinks = ['Privacidad', 'Términos', 'Cookies']

export function SiteFooter() {
  return (
    <footer className="flex flex-col gap-8 border-t border-neutral-100 px-6 py-12">
      <div className="grid grid-cols-4 gap-8 max-md:grid-cols-1">
        <div className="flex flex-col gap-3">
          <span className="text-lg font-bold text-primary">Sincra</span>
          <p className="text-sm text-ink-muted">
            La plataforma de comunicación y pedidos para pequeños negocios.
          </p>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="text-ink-muted hover:text-primary">
              <SiInstagram size={20} />
            </a>
            <a href="#" aria-label="Facebook" className="text-ink-muted hover:text-primary">
              <SiFacebook size={20} />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-ink-muted hover:text-primary">
              <SlSocialLinkedin size={20} />
            </a>
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-ink">{column.title}</span>
            {column.links.map((label) => (
              <a key={label} href="#" className="text-sm text-ink-muted hover:text-ink">
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-100 pt-6 max-md:flex-col max-md:gap-4">
        <span className="text-sm text-ink-muted">
          © {new Date().getFullYear()} Sincra. Todos los derechos reservados.
        </span>
        <div className="flex gap-4">
          {legalLinks.map((label) => (
            <a key={label} href="#" className="text-sm text-ink-muted hover:text-ink">
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
