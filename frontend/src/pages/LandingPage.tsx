import { useEffect, useRef } from 'react'
import LandingNavbar from '../components/landing/LandingNavbar'
import HeroSection from '../components/landing/HeroSection'
import ProductPreview from '../components/landing/ProductPreview'
import FeatureSection from '../components/landing/FeatureSection'
import ProductStory from '../components/landing/ProductStory'
import CollaborationSection from '../components/landing/CollaborationSection'
import OpportunitySection from '../components/landing/OpportunitySection'
import FinalCta from '../components/landing/FinalCta'
import LandingFooter from '../components/landing/LandingFooter'
import { useScrollStorytelling } from '../components/landing/useScrollStorytelling'

export default function LandingPage() {
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.title = 'CampusHub — College Collaboration Platform'
  }, [])

  useScrollStorytelling(mainRef)

  return (
    <div className="relative min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top scroll sentinel for zero-overhead navbar scroll state detection */}
      <div id="landing-top-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none -z-10" aria-hidden="true" />

      {/* 1. Sticky Navigation Header */}
      <LandingNavbar />

      <main ref={mainRef} className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Product Preview Mockup Window */}
        <ProductPreview />

        {/* 4. Core Features Pillar Grid */}
        <FeatureSection />

        {/* 5. Split-Layout Product Narrative */}
        <ProductStory />

        {/* 6. Collaboration & Team Formation Section */}
        <CollaborationSection />

        {/* 7. Opportunities & Career Pathways Section */}
        <OpportunitySection />

        {/* 8. Conversion / Final CTA Banner */}
        <FinalCta />
      </main>

      {/* 9. Landing Footer */}
      <LandingFooter />
    </div>
  )
}
