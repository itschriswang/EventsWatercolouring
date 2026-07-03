import { useEffect, useState } from 'react'
import GrainOverlay from './components/GrainOverlay.jsx'
import SectionWash from './components/SectionWash.jsx'
import Preloader from './components/Preloader.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import MobileNav from './components/MobileNav.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import Hero from './components/Hero.jsx'
import PullQuote from './components/PullQuote.jsx'
import EveningTimeline from './components/EveningTimeline.jsx'
import SelectedWork from './components/SelectedWork.jsx'
import AboutMe from './components/AboutMe.jsx'
import Packages from './components/Packages.jsx'
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

  // A URL hash (e.g. arriving at /#offerings from the /faq/ page) can't land
  // on target during the preloader: the body is scroll-locked and the
  // section may not exist in the very first paint, so the browser's native
  // scroll-to-fragment has nothing to grab onto. Once the preloader clears
  // and scroll unlocks, finish that jump ourselves.
  useEffect(() => {
    if (!revealed) return
    const id = window.location.hash.slice(1)
    if (!id) return
    const scrollToTarget = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    // A single rAF isn't always enough: hero art, WatercolourBloom and
    // webfonts can still be settling layout, which shifts the target's
    // offset after we've already scrolled. Double-rAF covers the common
    // case, and a `load`-triggered re-scroll corrects for anything slower.
    requestAnimationFrame(() => requestAnimationFrame(scrollToTarget))
    window.addEventListener('load', scrollToTarget)
    return () => window.removeEventListener('load', scrollToTarget)
  }, [revealed])

  return (
    <div className="relative min-h-screen bg-paper">
      <GrainOverlay />
      <Preloader onDone={() => setRevealed(true)} />

      <ScrollProgress />
      <SiteHeader revealed={revealed} />
      <MobileNav revealed={revealed} />

      {/* The page is paced like the night itself: the promise (hero), a
          couple's word for it (pull quote), the evening hour by hour (rust
          timeline), what's left in the morning (the keepsake wall), the
          person you're trusting with the room (the painter), then the
          decision and the ask. */}
      <main className="relative z-10 pb-28 md:pb-0">
        <Hero revealed={revealed} />

        {/* Carries the hero's warm paper down into the pull quote so the
            seam disappears instead of snapping to a pale aurora wash. */}
        <SectionWash
          seamGradient={
            'linear-gradient(to bottom, ' +
            '#F4EFE6 0%, ' +
            'rgba(244,239,230,0.55) 14%, ' +
            'rgba(228,136,156,0.05) 42%, ' +
            'transparent 100%)'
          }
        >
          <PullQuote />
        </SectionWash>

        <EveningTimeline />

        {/* One continuous wash behind the gallery through the painter,
            Packages and Enquire so it carries through without a seam at
            section boundaries. Masked to fade in over the gallery rather
            than switching on abruptly below it. */}
        <SectionWash mask="linear-gradient(to bottom, transparent 0%, black 30%, black 100%)">
          <SelectedWork />
          <div className="relative">
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
          <Packages />
          <EnquireForm />
        </SectionWash>
      </main>

      <Footer />
    </div>
  )
}
