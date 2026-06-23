import { useEffect, useState } from 'react'
import GrainOverlay from './components/GrainOverlay.jsx'
import BloomField from './components/BloomField.jsx'
import Preloader from './components/Preloader.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import Hero from './components/Hero.jsx'
import WhyWatercolour from './components/WhyWatercolour.jsx'
import TwoPaths from './components/TwoPaths.jsx'
import EveningTimeline from './components/EveningTimeline.jsx'
import SelectedWork from './components/SelectedWork.jsx'
import InMotion from './components/InMotion.jsx'
import AboutMe from './components/AboutMe.jsx'
import Packages from './components/Packages.jsx'
import BeyondWeddings from './components/BeyondWeddings.jsx'
import Faq from './components/Faq.jsx'
import EnquireForm from './components/EnquireForm.jsx'
import Footer from './components/Footer.jsx'

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
      <BloomField />
      <GrainOverlay />
      <Preloader onDone={() => setRevealed(true)} />

      <SiteHeader revealed={revealed} />

      <main>
        <Hero revealed={revealed} />
        <WhyWatercolour />
        <TwoPaths />
        <EveningTimeline />
        <SelectedWork />
        <InMotion />
        <AboutMe />
        <Packages />
        <BeyondWeddings />
        <Faq />
        <EnquireForm />
      </main>

      <Footer />
    </div>
  )
}
