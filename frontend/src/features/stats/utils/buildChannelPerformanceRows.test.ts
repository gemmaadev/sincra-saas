import { describe, it, expect } from 'vitest'
import { FiSlash } from 'react-icons/fi'
import { CHANNEL_BRANDS } from '@/shared/channels/channels'
import { buildChannelPerformanceRows } from './buildChannelPerformanceRows'

describe('buildChannelPerformanceRows', () => {
  // Given entries for known channels
  // When building the rows
  // Then each should get its brand name, icon and a share of the total revenue
  it('resolves brand names, icons and each share of the total revenue', () => {
    const rows = buildChannelPerformanceRows({
      entries: [
        { channel: 'GMAIL', orderCount: 3, revenue: '300', averageTicket: '100' },
        { channel: 'WHATSAPP', orderCount: 2, revenue: '100', averageTicket: '50' },
      ],
    })

    const gmailBrand = CHANNEL_BRANDS.find((brand) => brand.id === 'gmail')!
    const whatsappBrand = CHANNEL_BRANDS.find((brand) => brand.id === 'whatsapp')!

    expect(rows).toEqual([
      {
        label: 'Gmail',
        icon: gmailBrand.icon,
        colorClassName: 'text-gmail',
        revenue: 300,
        averageTicket: 100,
        percentage: 75,
      },
      {
        label: 'WhatsApp',
        icon: whatsappBrand.icon,
        colorClassName: 'text-whatsapp',
        revenue: 100,
        averageTicket: 50,
        percentage: 25,
      },
    ])
  })

  // Given an entry with no channel
  // When building the rows
  // Then it should be labeled "Sin canal", with a neutral fallback icon and color
  it('labels a null channel as "Sin canal", with a neutral fallback icon', () => {
    const rows = buildChannelPerformanceRows({
      entries: [{ channel: null, orderCount: 1, revenue: '50', averageTicket: '50' }],
    })

    expect(rows).toEqual([
      {
        label: 'Sin canal',
        icon: FiSlash,
        colorClassName: 'text-ink-muted',
        revenue: 50,
        averageTicket: 50,
        percentage: 100,
      },
    ])
  })

  // Given no entries at all
  // When building the rows
  // Then it should return an empty list
  it('returns an empty list when there are no entries', () => {
    const rows = buildChannelPerformanceRows({ entries: [] })

    expect(rows).toEqual([])
  })
})
