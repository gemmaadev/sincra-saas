import { Section } from '@/shared/components/section'
import { CHANNEL_BRANDS } from '@/shared/channels/channels'
import { OmnichannelHub } from './OmnichannelHub'

export function ChannelsSection() {
  return (
    <Section id="channels">
      <div className="grid grid-cols-2 items-center gap-12 max-lg:grid-cols-1">
        <div className="flex flex-col gap-6">
          <h2 className="max-w-xl text-4xl font-bold text-ink max-sm:text-3xl">
            Todos los canales que son importantes para{' '}
            <span className="text-primary">tu negocio</span>
          </h2>
          <p className="text-lg text-ink-muted max-lg:text-base">
            Centraliza, organiza y gestiona todas tus conversaciones desde un solo lugar. No importa
            de dónde vengan: WhatsApp, Instagram, email, web o tu propia tienda online.
          </p>

          <div className="flex flex-wrap gap-6 pt-4">
            {CHANNEL_BRANDS.map(({ id, name, icon: Icon, colorClassName }) => (
              <div key={id} className="flex flex-col items-center gap-2">
                <Icon size={28} className={colorClassName} aria-hidden="true" />
                <span className="text-sm text-ink-muted">{name}</span>
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
    </Section>
  )
}
