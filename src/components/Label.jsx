/** Small watercolour-drop SVG used as a bullet and inside section eyebrows. */
export function Drop({ className = '', fill = '#6E8CA8' }) {
  return (
    <svg className={className} viewBox="0 0 30 34" aria-hidden="true">
      <path
        d="M15 2 C20 11,27 17,27 23 a12 12 0 0 1 -24 0 C3 17,10 11,15 2 Z"
        fill={fill}
      />
    </svg>
  )
}

/** Section eyebrow: a drop glyph + a mono, wide-tracked uppercase label. */
export default function Label({ children, className = '', fill }) {
  return (
    <span className={'eyebrow inline-flex items-center gap-2 ' + className}>
      <Drop className="h-4 w-auto" fill={fill} />
      {children}
    </span>
  )
}
