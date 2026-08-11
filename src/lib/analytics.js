/**
 * Conversion events, sent through Plausible (see the snippet in each HTML
 * entry). Cookieless and consent-exempt, so there's no banner to design
 * around. `window.plausible` is the queue stub until the script arrives —
 * and if the tracker is blocked or absent, tracking is a silent no-op:
 * analytics must never be able to break the enquiry flow itself.
 *
 * Keep event names stable once live — Plausible goals match on the exact
 * string. Current names: 'Enquiry Started', 'Enquiry Sent', 'Enquiry Failed',
 * 'Enquiry Mailto'.
 */
export function track(event, props) {
  try {
    window.plausible?.(event, props ? { props } : undefined)
  } catch {
    /* never let analytics throw into the UI */
  }
}
