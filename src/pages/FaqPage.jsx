import GrainOverlay from '../components/GrainOverlay.jsx'
import ScrollProgress from '../components/ScrollProgress.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import MobileNav from '../components/MobileNav.jsx'
import WatercolourBloom from '../components/WatercolourBloom.jsx'
import Label from '../components/Label.jsx'
import Faq from '../components/Faq.jsx'
import Footer from '../components/Footer.jsx'
import { ENQUIRE_HREF } from '../lib/site.js'
import { FAQ } from '../content.js'

/**
 * The FAQ subpage — a standalone static page (see faq/index.html), not a
 * homepage section. There's no preloader gate here: chrome is revealed
 * immediately so a direct visit (or a nav click from the homepage) doesn't
 * replay the hero's load animation for a page that's all text.
 */
export default function FaqPage() {
  return (
    <div className="relative min-h-screen bg-paper">
      <GrainOverlay />
      <ScrollProgress />
      <SiteHeader revealed />
      <MobileNav revealed />

      <main className="relative z-10 pb-28 md:pb-0">
        {/* One continuous wash behind the hero and the whole FAQ list — the
            cards below are opaque paper tiles, not painted with the wash
            themselves, so the bloom only reads in the negative space around
            and between them, like paper cut-outs laid over a wet wash. */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              zIndex: 0,
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 16%, black 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 16%, black 100%)',
            }}
          >
            <WatercolourBloom />
          </div>

          <section className="relative w-full px-[5vw] pt-[clamp(7rem,16vw,10rem)] pb-[clamp(1.5rem,4vw,2.5rem)]">
            <div className="relative z-10 max-w-2xl">
              <Label gradient={['#C98B8C', '#D4A12E']}>{FAQ.label}</Label>
              <h1 className="mt-5 font-sentient text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-ink">
                {FAQ.title}
              </h1>
              <p className="mt-6 max-w-md leading-relaxed text-ink-soft">
                Answers to what people usually ask before booking. Can’t find
                yours?{' '}
                <a href={ENQUIRE_HREF} className="text-ink underline underline-offset-4">
                  Send me a note
                </a>
                .
              </p>
            </div>
          </section>

          <Faq />
        </div>
      </main>

      <Footer />
    </div>
  )
}
