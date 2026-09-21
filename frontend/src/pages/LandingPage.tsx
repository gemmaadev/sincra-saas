import { HeroSection } from '@/features/landing/components/HeroSection'
import { ChannelsSection } from '@/features/landing/components/ChannelsSection'
import { DemoSection } from '@/features/landing/components/DemoSection'
import { FeaturesSection } from '@/features/landing/components/FeaturesSection'
import { PricingSection } from '@/features/landing/components/PricingSection'

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <ChannelsSection />
      <DemoSection />
      <FeaturesSection />
      <PricingSection />
    </div>
  )
}
