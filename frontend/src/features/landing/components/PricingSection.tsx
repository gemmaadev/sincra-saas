import { Check, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Card, Section, SincraButton } from '@/shared'

const PLAN_ITEMS = [
  [
    'Inbox multicanal',
    'WhatsApp, Instagram, email y Messenger',
    'Clientes',
    'Pedidos',
    'Conversión de conversación a pedido',
    'Calendario',
    'Mapa de clientes',
    'Estadísticas',
    'Etiquetas y filtros',
  ],
  [
    'Asignación de conversaciones',
    'Equipo y permisos',
    'Automatizaciones',
    'IA de Sincra',
    'Clasificación de conversaciones',
    'Respuestas sugeridas',
    'Resúmenes de conversaciones',
    'Extracción de información para crear pedidos',
    'Búsqueda global',
    'Notificaciones',
  ],
]

export function PricingSection() {
  const navigate = useNavigate()

  return (
    <Section id="pricing" className="bg-blob-3/30">
      <div className="flex flex-col gap-6">
        <h2 className="max-w-xl text-4xl font-bold text-ink max-sm:text-3xl">
          Todo lo que necesitas, en un solo plan
        </h2>
        <p className="text-lg text-ink-muted max-lg:text-base">
          Centraliza conversaciones, clientes y pedidos desde un solo lugar.
        </p>

        <Card padding="lg" className="grid grid-cols-3 gap-12 max-lg:grid-cols-1">
          <div className="flex flex-col gap-4">
            <span className="text-2xl font-bold text-ink">Sincra</span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-primary">60€</span>
              <span className="text-ink-muted">/mes</span>
            </div>
            <span className="text-sm text-ink-muted">por negocio</span>
            <SincraButton variant="primary" onClick={() => navigate('/register')}>
              Empezar gratis
            </SincraButton>
          </div>

          {PLAN_ITEMS.map((column, index) => (
            <ul key={index} className="flex flex-col gap-3">
              {column.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-ink-muted">
                  <Check size={16} className="shrink-0 text-primary" />
                  <span className="leading-4">{item}</span>
                </li>
              ))}
            </ul>
          ))}
        </Card>

        <Card
          padding="lg"
          className="flex items-center justify-between gap-6 max-md:flex-col max-md:items-start"
        >
          <div className="flex flex-col gap-2">
            <p className="w-fit text-ink font-bold text-2xl">Precio fundador</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">35€</span>
              <span className="text-ink-muted">/mes para siempre</span>
            </div>
            <p className="text-sm text-ink-muted">
              Los primeros 10 negocios + negocios invitados. Todas las funcionalidades del plan, sin
              limitaciones.
            </p>
          </div>

          <div className="flex items-center gap-3 border-l border-neutral-100 pl-6 max-md:border-l-0 max-md:pl-0 max-md:border-t max-md:pt-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserPlus size={20} />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-ink">Invita a un negocio</span>
              <span className="text-sm text-ink-muted">
                y también podrá acceder al precio fundador.
              </span>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  )
}
