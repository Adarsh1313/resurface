import { Cormorant_Garamond } from 'next/font/google';
import { SmoothScroll } from '@/components/landing/SmoothScroll';
import { CustomCursor } from '@/components/landing/CustomCursor';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { ProductSection } from '@/components/landing/ProductSection';
import { LoopSection } from '@/components/landing/LoopSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

const cormorant = Cormorant_Garamond({
  weight: '300',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
});

export default function Home() {
  return (
    <div
      className={`rs-grain landing-page ${cormorant.variable}`}
      style={{
        background: 'var(--rs-bg-base)',
        color: 'var(--rs-text-primary)',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      <CustomCursor />
      <LandingNav />
      <SmoothScroll>
        <main>
          <HeroSection />
          <StatsSection />
          <ProductSection />
          <LoopSection />
          <FeaturesSection />
          <CtaSection />
        </main>
        <LandingFooter />
      </SmoothScroll>
    </div>
  );
}
