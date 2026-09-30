import { Play } from 'lucide-react'
import { Section } from '@/shared/components/section'

export function DemoSection() {
  return (
    <Section id="demo" className="bg-blob-3/30">
      <div className="grid grid-cols-2 items-center gap-12 max-lg:grid-cols-1">
        <div className="flex flex-col gap-6">
          <h2 className="max-w-xl text-4xl font-bold text-ink max-sm:text-3xl">
            Descubre cómo funciona en 2 minutos
          </h2>
          <p className="text-lg text-ink-muted max-lg:text-base">
            Te mostramos cómo centralizas conversaciones, conviertes mensajes en pedidos y gestionas
            todo desde un solo lugar.
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
    </Section>
  )
}
