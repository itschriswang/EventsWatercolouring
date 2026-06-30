import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import GrainOverlay from './components/GrainOverlay.jsx'
import BloomField from './components/BloomField.jsx'
import LiquidEther from './components/LiquidEther.jsx'
import SoftAurora from './components/SoftAurora.jsx'
import Preloader from './components/Preloader.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import MobileNav from './components/MobileNav.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import WhyWatercolour from './components/WhyWatercolour.jsx'
import EveningTimeline from './components/EveningTimeline.jsx'
import SelectedWork from './components/SelectedWork.jsx'
import AboutMe from './components/AboutMe.jsx'
import Packages from './components/Packages.jsx'
import Faq from './components/Faq.jsx'
import EnquireForm from './components/EnquireForm.jsx'
import Footer from './components/Footer.jsx'
import { useHeavyFx } from './hooks/useMediaQuery.js'
import { asset } from './lib/site.js'

// Warm watercolour pigments — pulled from the site's existing palette
const FLUID_COLORS = ['#C98B8C', '#AEBF56', '#C9A23A']

// Shared inline style for fixed full-viewport background layers
const BG_LAYER = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
  pointerEvents: 'none',
}

/**
 * Live wedding watercolour — a full-bleed, immersive editorial single page.
 * The preloader auto-dissolves (no gate); `revealed` then releases scroll and
 * plays the hero entrance, with each section revealing organically on scroll.
 */
export default function App() {
  const [revealed, setRevealed] = useState(false)
  const heavyFx = useHeavyFx()
  const reduce = useReducedMotion()

  // Lock scroll only while the preloader owns the viewport.
  useEffect(() => {
    document.body.style.overflow = revealed ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [revealed])

  // WebGL background: desktop fine-pointer only; fall back to the CSS bloom on
  // touch/mobile where GPU resources are more constrained.
  const showWebGL = heavyFx && !reduce

  return (
    <div className="relative min-h-screen bg-paper">
      {showWebGL ? (
        <>
          {/* Soft aurora — a slow, dreamy ambient glow at the very back */}
          <SoftAurora
            color1="#E4889C"
            color2="#AEBF56"
            brightness={0.38}
            speed={0.28}
            scale={1.3}
            bandHeight={0.45}
            bandSpread={1.4}
            octaveDecay={0.45}
            layerOffset={0.9}
            colorSpeed={0.55}
            noiseFrequency={2.2}
            noiseAmplitude={0.9}
            enableMouseInteraction={false}
          />
          {/* Liquid ether — fluid dynamics that respond to the cursor */}
          <LiquidEther
            colors={FLUID_COLORS}
            mouseForce={12}
            cursorSize={90}
            autoDemo
            autoSpeed={0.28}
            autoIntensity={1.4}
            autoResumeDelay={1500}
            autoRampDuration={0.8}
            resolution={0.4}
            style={{ ...BG_LAYER, opacity: 0.72 }}
          />
        </>
      ) : (
        <BloomField />
      )}
      <GrainOverlay />
      <Preloader onDone={() => setRevealed(true)} />

      <ScrollProgress />
      <SiteHeader revealed={revealed} />
      <MobileNav revealed={revealed} />

      <main className="relative z-10 pb-28 md:pb-0">
        <Hero revealed={revealed} />
        <Marquee />
        <div className="relative overflow-visible lg:grid lg:grid-cols-2 lg:items-start lg:divide-x lg:divide-transparent">
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
