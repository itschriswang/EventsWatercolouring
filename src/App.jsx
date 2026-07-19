import { useEffect, useState } from 'react'
import GradientDefs from './components/GradientDefs.jsx'
import GrainCanvas from './components/GrainCanvas.jsx'
import BloomCanvas from './components/BloomCanvas.jsx'
import SectionWash from './components/SectionWash.jsx'
import DeckleEdge from './components/DeckleEdge.jsx'
import Preloader from './components/Preloader.jsx'
import SkipLink from './components/SkipLink.jsx'
import PageTransition from './components/PageTransition.jsx'
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
import GlassRibbon from './components/GlassRibbon.jsx'

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
    // If the load event has already fired by the time the preloader hands
    // over (fast connections, cached assets), the listener would never run —
    // fall back to a short timer for the same correction.
    requestAnimationFrame(() => requestAnimationFrame(scrollToTarget))
    if (document.readyState === 'complete') {
      const t = window.setTimeout(scrollToTarget, 350)
      return () => window.clearTimeout(t)
    }
    window.addEventListener('load', scrollToTarget)
    return () => window.removeEventListener('load', scrollToTarget)
  }, [revealed])

  return (
    <div className="relative min-h-screen bg-paper">
      {/* Logo/`/#top` anchor. Must sit at the true document top, off the
          normal flow: anchoring `#top` to the hero put the target at
          (sticky header height) ≈ the header's 60px compress threshold, so
          the browser's anchor-chasing and the header's resize fed each other
          in an endless scroll/height oscillation. */}
      <span id="top" aria-hidden="true" className="absolute top-0" />
      {/* Live watercolour wash behind the whole page (one shared WebGL
          context), with the GPU paper grain over the top. Both degrade to the
          static CSS washes / SVG grain on mobile, reduced-motion or no-WebGL. */}
      <GradientDefs />
      <BloomCanvas revealed={revealed} />
      <GrainCanvas />
      <Preloader onDone={() => setRevealed(true)} />
      {/* Ink wipe to/from /corporate/ (see PageTransition). Independent of the
          Preloader: it only plays for an intercepted in-site navigation, so a
          fresh arrival still gets the intro, not a page wipe. */}
      <PageTransition />

      <SkipLink />
      <ScrollProgress />
      <SiteHeader revealed={revealed} />
      <MobileNav revealed={revealed} />

      {/* The page is paced like the night itself: the promise (hero), the
          evening hour by hour (rust timeline), the keepsake wall as proof,
          a couple's word for it right after they've seen the work, the
          person you're trusting with the room (the painter), then the
          decision and the ask. */}
      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        {/* The glass ribbon snakes the full page height BEHIND every section
            (first child, z-0), refracting the washes beneath it and ducking
            behind the opaque deep-ground blocks where the page breaks. */}
        <GlassRibbon />
        <Hero revealed={revealed} />

        {/* The evening timeline is now a folder floating on the page, so the
            space around it must read as the same painted paper as the sections
            before and after — the same WatercolourBloom wash the gallery run
            uses sits behind the folder here too, rather than leaving it on flat
            paper that looks like a different ground. */}
        <SectionWash>
          <EveningTimeline />
        </SectionWash>

        {/* One wash behind the gallery through the painter, so those three
            read as a single continuous painting. Masked to fade in over the
            gallery rather than switching on abruptly below it — but allowed
            to stop dead at the bottom, where the page deliberately breaks. */}
        <SectionWash mask="linear-gradient(to bottom, transparent 0%, black 30%, black 100%)">
          <SelectedWork />
          <PullQuote />
          {/* The painter — bio beside the portrait, which is itself the kit
              stage: the print with the tools of the desk fanning out around it. */}
          <AboutMe />
        </SectionWash>

        {/* Hard editorial break: the painter's sheet tears off along a
            deckled paper edge and the offerings open on a deeper ground with
            a wash of their own, so what follows reads as a new section
            starting — not a continuation of the same sheet. */}
        <div className="relative bg-paper-deep">
          <DeckleEdge className="absolute inset-x-0 top-0 z-10 h-[18px] w-full md:h-6" />
          <SectionWash variant="warm">
            <Packages />
            <EnquireForm />
          </SectionWash>
        </div>
      </main>

      <Footer />
    </div>
  )
}
