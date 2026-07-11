import Label from './Label.jsx'
import SplitText from './SplitText.jsx'
import { PAINTER } from '../content.js'
import Sparkles from './Sparkles.jsx'
import { withUnderline } from './Underline.jsx'
import KitStage from './MyKit.jsx'

/**
 * "The painter" — the bio, set beside the portrait. The portrait isn't a static
 * frame any more: it's the kit stage (KitStage), a flat matted print of Chris
 * with the tools of the desk fanning out around it as the section scrolls in
 * (and re-packing on the way back up).
 */
export default function AboutMe() {
  return (
    <section
      id="painter"
      className="relative w-full overflow-visible px-[5vw] pt-[clamp(4rem,8vw,7rem)]"
    >
      <div className="relative pb-[clamp(5rem,10vw,8rem)]">
        {/* The bio block is capped and left-aligned (no mx-auto) so it sits
            toward the left with breathing room on the right — which is also
            where the kit fans out into, so the tools have room to spread. */}
        <div className="grid grid-cols-12 items-center gap-x-8 gap-y-6 lg:max-w-[64rem]">
          {/* Title + bio + signature — first in the reading order everywhere */}
          <div className="relative col-span-12 sm:col-span-6 sm:col-start-1 lg:col-span-5 lg:col-start-1 order-1">
            <Sparkles variant="burst" className="absolute -top-4 right-0 h-14 w-14 lg:hidden" />
            <Label gradient={['#FFCDA1', '#E89B63']}>{PAINTER.label}</Label>
            <SplitText
              as="h2"
              unit="char"
              lines={PAINTER.title}
              emphasis={PAINTER.emphasis}
              emphasisItalic
              inkBleed
              className="display-lg mt-5 text-ink"
            />
            <div className="mt-8 flex flex-col gap-5 text-[clamp(1rem,1.1vw,1.15rem)] leading-relaxed text-ink-soft">
              {PAINTER.body.map((p, i) => (
                <p key={i}>
                  {i === 1
                    ? withUnderline(p, 'something real to take home', { className: 'text-rust' })
                    : p}
                </p>
              ))}
            </div>
            {PAINTER.signature && (
              <p className="mt-6 font-mono text-4xl text-terracotta">
                {PAINTER.signature}
              </p>
            )}
          </div>

          {/* The portrait, now the kit stage — right on desktop, below the bio
              on mobile. Given the roomier column and the whitespace beyond it,
              the fan has space to open. */}
          <div className="col-span-12 sm:col-span-6 sm:col-start-7 lg:col-span-7 lg:col-start-6 order-2">
            <KitStage />
          </div>
        </div>
      </div>
    </section>
  )
}
