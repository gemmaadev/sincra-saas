import { SiGmail, SiWhatsapp, SiInstagram, SiMessenger } from 'react-icons/si'
import { PiMicrosoftOutlookLogoFill } from 'react-icons/pi'
import { Section } from '@/shared/components/section'
import { OmnichannelHub } from './OmnichannelHub'

const CHANNELS = [
  { icon: <SiGmail size={28} className="text-gmail" aria-hidden="true" />, label: 'Gmail' },
  {
    icon: <PiMicrosoftOutlookLogoFill size={28} className="text-outlook" aria-hidden="true" />,
    label: 'Outlook',
  },
  {
    icon: <SiWhatsapp size={28} className="text-whatsapp" aria-hidden="true" />,
    label: 'WhatsApp',
  },
  {
    icon: <SiInstagram size={28} className="text-instagram" aria-hidden="true" />,
    label: 'Instagram',
  },
  {
    icon: <SiMessenger size={28} className="text-messenger" aria-hidden="true" />,
    label: 'Messenger',
  },
]

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
            {CHANNELS.map((channel) => (
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
    </Section>
  )
}
