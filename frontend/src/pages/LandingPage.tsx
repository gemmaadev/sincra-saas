import { useNavigate } from 'react-router'
import { Play } from 'lucide-react'
import { SincraButton } from '@/shared/components/button'
import { OmnichannelHub } from '@/features/landing/components/OmnichannelHub'
import { SiGmail, SiWhatsapp, SiInstagram, SiMessenger } from 'react-icons/si'
import { PiMicrosoftOutlookLogoFill } from 'react-icons/pi'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div>
      <section
        id="product"
        className="relative overflow-hidden px-20 py-20 max-lg:px-12 max-md:px-6 max-md:py-16"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 right-[-10%] h-125 w-125 rounded-full bg-blob-1 blur-3xl max-lg:h-75 max-lg:w-75" />
          <div className="absolute top-[30%] -left-32 h-100 w-100 rounded-full bg-blob-3 blur-3xl max-lg:h-60 max-lg:w-60" />
          <div className="absolute bottom-0 right-[15%] h-75 w-75 rounded-full bg-blob-4 blur-3xl max-lg:h-50 max-lg:w-50" />
        </div>

        <div className="relative grid grid-cols-2 items-center gap-12 max-lg:grid-cols-1">
          <div className="flex flex-col gap-6">
            <h1 className="max-w-xl text-5xl font-bold text-ink max-lg:text-4xl max-sm:text-3xl">
              Gestiona tus comunicaciones y pedidos multicanal,{' '}
              <span className="text-primary">sin complicaciones</span>
            </h1>
            <p className="text-lg text-ink-muted max-lg:text-base">
              La plataforma que centraliza tus conversaciones, clientes y pedidos en un único
              espacio. Diseñada para pequeños comercios y ecommerces que quieren vender más y
              ahorrar tiempo, sin herramientas complejas ni precios de empresa.
            </p>
            <div className="flex flex-row gap-4 max-sm:flex-col">
              <SincraButton variant="primary" onClick={() => navigate('/register')}>
                Empieza gratis
              </SincraButton>
              <SincraButton variant="secondary">Ver cómo funciona</SincraButton>
            </div>
          </div>

          <div className="flex aspect-video items-center justify-center rounded-card border border-dashed border-neutral-300 bg-surface-card text-sm text-ink-muted">
            Mockup de la bandeja pendiente
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative overflow-hidden px-20 py-20 max-lg:px-12 max-md:px-6 max-md:py-16"
      >
        <div className="grid grid-cols-2 items-center gap-12 max-lg:grid-cols-1">
          <div className="flex flex-col gap-6">
            <h2 className="max-w-xl text-4xl font-bold text-ink max-sm:text-3xl">
              Todos los canales que son importantes para{' '}
              <span className="text-primary">tu negocio</span>
            </h2>
            <p className="text-lg text-ink-muted max-lg:text-base">
              Centraliza, organiza y gestiona todas tus conversaciones desde un solo lugar. No
              importa de dónde vengan: WhatsApp, Instagram, email, web o tu propia tienda online.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              {[
                { icon: <SiGmail size={28} className="text-gmail" />, label: 'Gmail' },
                {
                  icon: <PiMicrosoftOutlookLogoFill size={28} className="text-outlook" />,
                  label: 'Outlook',
                },
                { icon: <SiWhatsapp size={28} className="text-whatsapp" />, label: 'WhatsApp' },
                { icon: <SiInstagram size={28} className="text-instagram" />, label: 'Instagram' },
                { icon: <SiMessenger size={28} className="text-messenger" />, label: 'Messenger' },
              ].map((channel) => (
                <div key={channel.label} className="flex flex-col items-center gap-2">
                  {channel.icon}
                  <span className="text-sm text-ink-muted">{channel.label}</span>
                </div>
              ))}
            </div>
          </div>

          <OmnichannelHub
            accent="var(--color-primary)"
            speed={1.2}
            avatars={['/avatar-cliente-1.webp', '/avatar-cliente-2.webp', '/avatar-cliente-3.webp']}
          />
        </div>
      </section>

      <section
        id="demo"
        className="relative overflow-hidden px-20 py-20 bg-blob-3/30 max-lg:px-12 max-md:px-6 max-md:py-16"
      >
        <div className="grid grid-cols-2 items-center gap-12 max-lg:grid-cols-1">
          <div className="flex flex-col gap-6">
            <h2 className="max-w-xl text-4xl font-bold text-ink max-sm:text-3xl">
              Descubre cómo funciona en 2 minutos
            </h2>
            <p className="text-lg text-ink-muted max-lg:text-base">
              Te mostramos cómo centralizas conversaciones, conviertes mensajes en pedidos y
              gestionas todo desde un solo lugar.
            </p>

            <button className="flex w-fit items-center gap-3 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                <Play size={16} fill="currentColor" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium text-primary">Ver vídeo demo</span>
                <span className="text-xs text-ink-muted">2 min</span>
              </span>
            </button>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-blob-2 blur-3xl max-lg:h-40 max-lg:w-40" />
              <div className="absolute -bottom-12 -left-12 h-72 w-72 rounded-full bg-blob-4 blur-3xl max-lg:h-44 max-lg:w-44" />
            </div>

            <div className="relative flex aspect-video items-center justify-center rounded-card border border-dashed border-neutral-300 bg-surface-card text-sm text-ink-muted">
              <button
                aria-label="Reproducir vídeo demo"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105"
              >
                <Play size={24} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
