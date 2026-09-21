import { useNavigate } from 'react-router'
import { SincraButton, Section } from '@/shared'

export function CtaSection() {
  const navigate = useNavigate()

  return (
    <Section id="contact" className="bg-primary">
      <div className="relative flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-2xl text-4xl font-bold text-white max-sm:text-3xl">
          ¿Listo para centralizar tus comunicaciones y vender más?
        </h2>
        <p className="max-w-xl text-lg text-white/80 max-lg:text-base">
          Únete ahora y asegura el precio fundador de 35 €/mes para siempre.
        </p>
        <div className="flex flex-row gap-4 max-sm:flex-col">
          <SincraButton
            variant="secondary"
            className="border-white bg-white text-primary hover:bg-white/90"
            onClick={() => navigate('/register')}
          >
            Empezar ahora
          </SincraButton>
        </div>
      </div>
    </Section>
  )
}
