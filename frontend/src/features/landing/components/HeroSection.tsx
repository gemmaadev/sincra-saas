import { useNavigate } from 'react-router'
import { SincraButton } from '@/shared/components/button'
import { Section } from '@/shared/components/section'

export function HeroSection() {
  const navigate = useNavigate()

  return (
    <Section id="product">
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
            La plataforma que centraliza tus conversaciones, clientes y pedidos en un único espacio.
            Diseñada para pequeños comercios y ecommerces que quieren vender más y ahorrar tiempo,
            sin herramientas complejas ni precios de empresa.
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
    </Section>
  )
}
