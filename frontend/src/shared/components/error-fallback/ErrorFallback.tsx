import { SincraButton } from '@/shared/components/button'

export function ErrorFallback() {
  return (
    <div
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center"
    >
      <img
        src="/error-fallback-image.webp"
        alt="Ilustración de un gato junto a una planta caída"
        width={700}
        height={549}
        className="w-87.5 h-auto"
      />
      <p className="text-3xl font-bold text-ink">¡Oh nooo! Algo ha salido mal</p>
      <p className="max-w-sm text-lg text-ink-muted">
        Ha ocurrido un error inesperado. Intenta recargar la página.
      </p>
      <SincraButton
        variant="primary"
        className="text-xl! px-6"
        onClick={() => window.location.reload()}
      >
        Recargar página
      </SincraButton>
    </div>
  )
}
