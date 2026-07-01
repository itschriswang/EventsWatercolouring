import { useEffect, useState } from 'react'
import GrainOverlay from './components/GrainOverlay.jsx'
import WatercolourBloom from './components/WatercolourBloom.jsx'
import Preloader from './components/Preloader.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import MobileNav from './components/MobileNav.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Hero from './components/Hero.jsx'
import WhatYouKeep from './components/WhatYouKeep.jsx'
import EveningTimeline from './components/EveningTimeline.jsx'
import SelectedWork from './components/SelectedWork.jsx'
import AboutMe from './components/AboutMe.jsx'
import Packages from './components/Packages.jsx'
import Faq from './components/Faq.jsx'
import EnquireForm from './components/EnquireForm.jsx'
import Footer from './components/Footer.jsx'
import { asset } from './lib/site.js'

/**
 * Live wedding watercolour — a full-bleed, immersive editorial single page.
 * The preloader auto-dissolves (no gate); `revealed` then releases scroll and
 * plays the hero entrance, with each section revealing organically on scroll.
 */
export default function App() {
  const [revealed, setRevealed] = useState(false)

  // Lock scroll only while the preloader owns the viewport.
  useEffect(() => {
    document.body.style.overflow = revealed ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [revealed])

  return (
    <div className="relative min-h-screen bg-paper">
      <GrainOverlay />
      <Preloader onDone={() => setRevealed(true)} />

      <ScrollProgress />
      <SiteHeader revealed={revealed} />
      <MobileNav revealed={revealed} />

      <main className="relative z-10 pb-28 md:pb-0">
        <Hero revealed={revealed} />
        <div className="relative overflow-visible">
          {/* WatercolourBloom — clipped to this section, below all content */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
            <WatercolourBloom />
          </div>
          {/* Top blend — carries the hero's warm paper down into this block so the
              seam disappears instead of snapping to a pale aurora wash. Pure CSS,
              behind all content, reduced-motion safe. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
            style={{
              zIndex: 0,
              background:
                'linear-gradient(to bottom, ' +
                '#F4EFE6 0%, ' +
                'rgba(244,239,230,0.55) 14%, ' +
                'rgba(228,136,156,0.05) 42%, ' +
                'transparent 100%)',
            }}
          />
          <AboutMe />
          <picture>
            <source srcSet={asset('assets/bloom-accent-2.webp')} type="image/webp" />
            <img
              src={asset('assets/bloom-accent-2.png')}
              alt=""
              aria-hidden="true"
              width="1200"
              height="1028"
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute bottom-0 right-0 z-20 w-[19rem] sm:w-[22rem] lg:w-[28rem]"
            />
          </picture>
        </div>
        {/* The night and its keepsake coda are one movement: the rust timeline
            runs to its "destination" marker, then WhatYouKeep resolves that
            back into warm paper (its own top wash dissolves the seam). Grouped
            so they read as a single arc — what happens, then what's left. */}
        <div className="relative">
          <EveningTimeline />
          <WhatYouKeep />
        </div>
        <SelectedWork />
        <div className="relative">
          {/* One continuous WatercolourBloom behind Packages/Faq/Enquire so
              the wash carries through all three without a seam at the section
              boundaries — each section's own small ad-hoc gradients were
              removed so they don't compete with it. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
            <WatercolourBloom />
          </div>
          <Packages />
          <Faq />
          <EnquireForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
