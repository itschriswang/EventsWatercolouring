/** Four-pointed star SVG used as a bullet and inside section eyebrows. */
export function Drop({ className = '', fill = '#6E8CA8' }) {
  return (
    <svg className={className} viewBox="0 0 30 34" aria-hidden="true">
      <path
        d="M15 2 C17 2,18 9,19 10 C19.7 11.3,20.7 12.3,22 13 C23 14,28 14,28 17 C28 20,23 20,22 21 C20.7 21.7,19.7 22.7,19 24 C18 25,17 32,15 32 C13 32,12 25,11 24 C10.3 22.7,9.3 21.7,8 21 C7 20,2 20,2 17 C2 14,7 14,8 13 C9.3 12.3,10.3 11.3,11 10 C12 9,13 2,15 2 Z"
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
