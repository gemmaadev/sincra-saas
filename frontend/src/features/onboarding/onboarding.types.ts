import type { ChannelBrand, ChannelId } from '@/shared/channels/channels'

export interface OnboardingChannel extends ChannelBrand {
  integration: 'real' | 'mocked'
  description: string
}

export interface SelectOption {
  value: string
  label: string
}

export interface OnboardingData {
  businessName: string
  sector: string
  description: string
  country: string
  connectedChannels: ChannelId[]
}
