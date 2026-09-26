import type { IconType } from 'react-icons'
import { SiGmail, SiWhatsapp, SiInstagram, SiMessenger } from 'react-icons/si'
import { PiMicrosoftOutlookLogoFill } from 'react-icons/pi'

export type ChannelId = 'gmail' | 'outlook' | 'whatsapp' | 'instagram' | 'messenger'

export interface ChannelBrand {
  id: ChannelId
  name: string
  icon: IconType
  colorClassName: string
}

export const CHANNEL_BRANDS: ChannelBrand[] = [
  { id: 'gmail', name: 'Gmail', icon: SiGmail, colorClassName: 'text-gmail' },
  {
    id: 'outlook',
    name: 'Outlook',
    icon: PiMicrosoftOutlookLogoFill,
    colorClassName: 'text-outlook',
  },
  { id: 'whatsapp', name: 'WhatsApp', icon: SiWhatsapp, colorClassName: 'text-whatsapp' },
  { id: 'instagram', name: 'Instagram', icon: SiInstagram, colorClassName: 'text-instagram' },
  { id: 'messenger', name: 'Messenger', icon: SiMessenger, colorClassName: 'text-messenger' },
]
