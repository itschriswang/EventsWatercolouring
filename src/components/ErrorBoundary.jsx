import { Component } from 'react'
import { EMAIL } from '../lib/site.js'

/**
 * Last-resort catch for a render throw anywhere in the tree. Without it, one
 * error in any of ~40 components unmounts the whole page — and if it lands
 * while the preloader owns the viewport, leaves a blank scroll-locked screen.
 * The fallback is plain paper-toned markup (inline styles, no Tailwind, no
 * Framer) so it cannot depend on anything that may itself have failed, and
 * it keeps the one thing a stranded visitor needs: a way to reach Chris.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    // A crashed tree can leave the scroll-lock styles behind; clear them so
    // the fallback (and the rest of the document) is actually usable.
    const b = document.body.style
    b.position = ''
    b.top = ''
    b.overflow = ''
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#F7F4EF',
          color: '#352E30',
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '28rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 400, lineHeight: 1.25 }}>
            Something smudged.
          </h1>
          <p style={{ marginTop: '1rem', lineHeight: 1.6 }}>
            This page hit a snag while painting itself. A refresh usually
            clears it, or you can write to me directly at{' '}
            <a href={`mailto:${EMAIL}`} style={{ color: '#B04A76' }}>
              {EMAIL}
            </a>
            .
          </p>
          <p style={{ marginTop: '1.25rem' }}>
            <a href="/" style={{ color: '#B04A76' }}>
              Back to the studio &rarr;
            </a>
          </p>
        </div>
      </div>
    )
  }
}
