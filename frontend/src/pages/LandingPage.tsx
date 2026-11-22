import { HeroSection } from '@/features/landing/components/HeroSection'
import { ChannelsSection } from '@/features/landing/components/ChannelsSection'
import { DemoSection } from '@/features/landing/components/DemoSection'
import { FeaturesSection } from '@/features/landing/components/FeaturesSection'
import { PricingSection } from '@/features/landing/components/PricingSection'
import { CtaSection } from '@/features/landing/components/CtaSection'
import { HowWorksSection } from '@/features/landing/components/HowWorksSection'
import { AiAgentsSection } from '@/features/landing/components/AiAgentsSection'

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <ChannelsSection />
      <DemoSection />
      <HowWorksSection />
      <FeaturesSection />
      <AiAgentsSection />
      <PricingSection />
      <CtaSection />
    </div>
  )
}
