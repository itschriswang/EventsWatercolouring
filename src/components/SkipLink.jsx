/**
 * Skip-to-content link — the first tabbable element on every page, invisible
 * until keyboard focus reaches it. A keyboard or screen-reader visitor lands
 * on the content in one Tab instead of walking the whole nav; pointer users
 * never see it. Styled as the site's own paper pill (approved lilac shadow,
 * no greys) so when it does appear it reads as part of the page, not chrome.
 */
export default function SkipLink({ target = '#main' }) {
  return (
    <a
      href={target}
      className="fixed left-4 top-4 z-[130] -translate-y-24 rounded-full bg-paper px-5 py-2.5 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink shadow-[0_10px_30px_-10px_rgba(94,74,140,0.45)] outline-none transition-transform duration-200 focus-visible:translate-y-0"
    >
      Skip to content
    </a>
  )
}
