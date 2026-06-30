import { useEffect, useState } from 'react'
import GrainOverlay from './components/GrainOverlay.jsx'
import SoftAurora from './components/SoftAurora.jsx'
import Preloader from './components/Preloader.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import MobileNav from './components/MobileNav.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Hero from './components/Hero.jsx'
import WhyWatercolour from './components/WhyWatercolour.jsx'
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
        <div className="relative overflow-visible lg:grid lg:grid-cols-2 lg:items-start lg:divide-x lg:divide-transparent">
          {/* SoftAurora — clipped to this section, below all content */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
            <SoftAurora
              color1="#E8C4D0"
              color2="#C8D890"
              brightness={0.18}
              speed={0.42}
              scale={1.5}
              bandHeight={0.42}
              bandSpread={1.5}
              octaveDecay={0.5}
              layerOffset={1.2}
              colorSpeed={0.68}
              noiseFrequency={2.4}
              noiseAmplitude={1.1}
              enableMouseInteraction={false}
            />
          </div>
          <WhyWatercolour />
          <AboutMe />
          <img
            src={asset('assets/bloom-accent-2.png')}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 z-20 w-[19rem] sm:w-[22rem] lg:w-[28rem]"
          />
        </div>
        <EveningTimeline />
        <SelectedWork />
        <Packages />
        <Faq />
        <EnquireForm />
      </main>

      <Footer />
    </div>
  )
}
