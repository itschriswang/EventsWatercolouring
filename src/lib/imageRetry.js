// Graceful fallback when an image fails to load: retry a couple of times
// before giving up, THEN hide the broken <img> so the paper-toned card remains
// instead of a broken-image glyph. The retries matter on iOS: Safari fires
// `error` for transient decode failures under memory pressure (not just
// missing files), and a permanent `display: none` on the first blip left a
// painting blanked for the rest of the visit — the card and its dressing
// still rendered, the artwork never came back. Re-assigning `src` re-runs the
// <picture> selection algorithm, which re-attempts the load (usually straight
// from cache). Shared by the gallery wall and the lightbox coverflow so both
// carry the same recovery, not just the wall.
export const hideOnError = (e) => {
  const img = e.currentTarget
  const tries = Number(img.dataset.retries || 0)
  if (tries < 2) {
    img.dataset.retries = String(tries + 1)
    const src = img.getAttribute('src')
    setTimeout(() => {
      // Unmounted (lightbox churn, layout swap) — nothing to retry.
      if (!img.isConnected) return
      img.src = src
    }, 600 * (tries + 1))
  } else {
    img.style.display = 'none'
  }
}
