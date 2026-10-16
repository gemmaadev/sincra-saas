import { CHANNEL_BRANDS } from '@/shared/channels/channels'
import type { SelectOption, OnboardingChannel } from './onboarding.types'

export const ONBOARDING_STEPS = [
  { number: 1, label: 'Negocio' },
  { number: 2, label: 'Canales' },
  { number: 3, label: 'Listo' },
]

export const COUNTRY_OPTIONS: SelectOption[] = [
  { value: 'ES', label: 'España' },
  { value: 'PT', label: 'Portugal' },
  { value: 'FR', label: 'Francia' },
  { value: 'IT', label: 'Italia' },
  { value: 'MX', label: 'México' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CO', label: 'Colombia' },
  { value: 'CL', label: 'Chile' },
  { value: 'PE', label: 'Perú' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'OTHER', label: 'Otro' },
]

const ONBOARDING_CHANNEL_DETAILS: Record<
  string,
  { integration: 'real' | 'mocked'; description: string }
> = {
  gmail: {
    integration: 'real',
    description: 'Conecta tu cuenta de Gmail usando OAuth para recibir correos de forma segura.',
  },
  outlook: {
    integration: 'real',
    description: 'Conecta tu cuenta de Outlook usando OAuth para recibir correos de forma segura.',
  },
  whatsapp: {
    integration: 'mocked',
    description: 'Recibe y gestiona tus mensajes de WhatsApp en la plataforma.',
  },
  instagram: {
    integration: 'mocked',
    description: 'Gestiona tus mensajes y menciones de Instagram en la plataforma.',
  },
  messenger: {
    integration: 'mocked',
    description: 'Recibe y gestiona tus mensajes de Messenger en la plataforma.',
  },
}

export const ONBOARDING_CHANNELS: OnboardingChannel[] = CHANNEL_BRANDS.map((brand) => ({
  ...brand,
  ...ONBOARDING_CHANNEL_DETAILS[brand.id],
}))

export const TOTAL_CHANNELS_COUNT = ONBOARDING_CHANNELS.length

export const DESCRIPTION_MAX_LENGTH = 200
