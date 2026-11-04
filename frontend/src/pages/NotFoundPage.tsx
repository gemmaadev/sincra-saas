import { useNavigate } from 'react-router'
import { SincraButton } from '@/shared'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-2 items-center gap-12 px-20 py-20 max-lg:grid-cols-1 max-lg:px-12 max-md:px-6 max-md:py-16">
      <div className="flex flex-col gap-6">
        <p className="text-8xl font-bold text-primary-dark">Error 404</p>
        <h1 className="text-4xl font-bold text-ink max-sm:text-3xl">
          Ups... parece que esta página <span className="text-primary">no existe.</span>
        </h1>
        <p className="text-lg text-ink-muted">
          La página que buscas puede haber sido eliminada, cambiado de dirección o nunca haber
          existido.
        </p>
        <SincraButton variant="primary" onClick={() => navigate('/')} className="w-fit">
          Volver al inicio
        </SincraButton>
      </div>

      <div className="flex items-center justify-center">
        <img
          src="/not-found-image.webp"
          alt="Ilustración de un gato durmiendo sobre un sobre de correo, con un avión de papel volando"
          width={900}
          height={779}
          className="w-full max-w-md"
        />
      </div>
    </div>
  )
}
