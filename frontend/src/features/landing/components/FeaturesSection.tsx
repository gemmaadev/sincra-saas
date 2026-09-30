import { Mail, ShoppingCart, Truck, User, MapPin, Users, TrendingUp, Sparkles } from 'lucide-react'
import { Card } from '@/shared/components/card'
import { Section } from '@/shared/components/section'

const FEATURES = [
  {
    icon: <Mail size={22} />,
    title: 'Inbox unificado',
    description: 'Todas tus conversaciones en un solo lugar, sin saltar entre apps.',
  },
  {
    icon: <ShoppingCart size={22} />,
    title: 'Conversión a pedido',
    description: 'Convierte chats en pedidos en un clic, con toda la información del cliente.',
  },
  {
    icon: <Truck size={22} />,
    title: 'Seguimiento de pedidos',
    description: 'Controla el estado y la entrega de cada pedido en tiempo real.',
  },
  {
    icon: <User size={22} />,
    title: 'Ficha de cliente',
    description: 'Historial completo de conversaciones, pedidos y datos del cliente.',
  },
  {
    icon: <MapPin size={22} />,
    title: 'Mapa de clientes',
    description: 'Descubre de dónde vienen tus clientes y visualiza tu área de negocio.',
  },
  {
    icon: <Users size={22} />,
    title: 'Equipo y permisos',
    description: 'Asigna conversaciones, roles y controla el acceso de tu equipo.',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Estadísticas e informes',
    description: 'Conoce tu rendimiento y toma mejores decisiones con datos reales.',
  },
  {
    icon: <Sparkles size={22} />,
    title: 'Asistente de IA',
    description: 'Clasifica, responde y prioriza con inteligencia artificial.',
  },
]

export function FeaturesSection() {
  return (
    <Section id="features">
      <div className="flex flex-col gap-6">
        <h2 className="max-w-xl text-4xl font-bold text-ink max-sm:text-3xl">
          Diseñada para tu día a día
        </h2>
        <p className="max-w-2xl text-lg text-ink-muted max-lg:text-base">
          Herramientas simples y potentes para que puedas enfocarte en lo importante: tus clientes,
          tus pedidos y hacer crecer tu negocio.
        </p>

        <div className="grid grid-cols-4 gap-6 pt-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              padding="md"
              className="relative flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {feature.icon}
              </span>
              <span className="font-semibold text-ink">{feature.title}</span>
              <p className="text-sm text-ink-muted">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  )
}
