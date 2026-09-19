import { useNavigate } from 'react-router'
import { SincraButton } from '@/shared/components/button'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div>
      <section
        id="product"
        className="relative overflow-hidden px-6 py-16 md:px-12 lg:px-20 lg:py-20"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 right-[-10%] h-75 w-75 rounded-full bg-blob-1 blur-3xl lg:h-125 lg:w-125" />
          <div className="absolute top-[30%] -left-32 h-60 w-60 rounded-full bg-blob-3 blur-3xl lg:h-100 lg:w-100" />
          <div className="absolute bottom-0 right-[15%] h-50 w-50 rounded-full bg-blob-4 blur-3xl lg:h-75 lg:w-75" />
        </div>

        <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <h1 className="max-w-xl text-3xl font-bold text-ink sm:text-4xl lg:text-5xl">
              Gestiona tus comunicaciones y pedidos multicanal,{' '}
              <span className="text-primary">sin complicaciones</span>
            </h1>
            <p className="text-base text-ink-muted lg:text-lg">
              La plataforma que centraliza tus conversaciones, clientes y pedidos en un único
              espacio. Diseñada para pequeños comercios y ecommerces que quieren vender más y
              ahorrar tiempo, sin herramientas complejas ni precios de empresa.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
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
    </div>
  )
}
