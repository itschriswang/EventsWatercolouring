import { useEffect, useState } from 'react'
import Preloader from './components/Preloader.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import Hero from './components/Hero.jsx'
import ProcessGrid from './components/ProcessGrid.jsx'
import Offerings from './components/Offerings.jsx'
import EnquireFooter from './components/EnquireFooter.jsx'

/**
 * The premium watercolour landing page.
 *
 * Flow: the gamified Preloader blocks the viewport and locks scroll until the
 * visitor "paints to enter"; that hands over to `revealed`, which releases
 * scroll and triggers the staggered hero, then the interactive process grid,
 * offerings and closing CTA.
 */
export default function App() {
  const [revealed, setRevealed] = useState(false)

  // Lock body scroll while the preloader owns the viewport.
  useEffect(() => {
    document.body.style.overflow = revealed ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [revealed])

  return (
    <div id="top" className="min-h-screen bg-paper">
      <Preloader onEnter={() => setRevealed(true)} />

      <SiteHeader revealed={revealed} />

      <main>
        <Hero revealed={revealed} />
        <ProcessGrid />
        <Offerings />
      </main>

      <EnquireFooter />
    </div>
  )
}
