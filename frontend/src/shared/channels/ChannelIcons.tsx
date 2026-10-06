import { CHANNEL_BRANDS } from './channels'

interface ChannelIconsProps {
  channels: string[]
  size?: number
}

export function ChannelIcons({ channels, size = 20 }: ChannelIconsProps) {
  return (
    <div className="flex items-center gap-2">
      {channels.map((channel) => {
        const brand = CHANNEL_BRANDS.find(
          (channelBrand) => channelBrand.id === channel.toLowerCase(),
        )

        if (!brand) {
          return (
            <span key={channel} className="text-xs text-ink-muted" title={channel}>
              {channel}
            </span>
          )
        }

        const Icon = brand.icon
        return (
          <Icon
            key={channel}
            size={size}
            className={brand.colorClassName}
            aria-label={brand.name}
          />
        )
      })}
    </div>
  )
}
