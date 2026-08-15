type LogoProps = {
  /** Show full horizontal lockup (default) or mark only. */
  variant?: 'horizontal' | 'mark'
  /** Use light artwork for dark backgrounds (footer / dark hero). */
  inverted?: boolean
  className?: string
  /** Height in CSS pixels; width scales with aspect ratio. */
  height?: number
}

const SRC = {
  horizontal: '/logo-horizontal.png',
  horizontalLight: '/logo-horizontal-light.png',
  mark: '/logo-mark.png',
} as const

/** Official LeanChem logo from the Apr 2025 brand guideline. */
export function LeanChemLogo({
  variant = 'horizontal',
  inverted = false,
  className = '',
  height = 36,
}: LogoProps) {
  const src =
    variant === 'mark'
      ? SRC.mark
      : inverted
        ? SRC.horizontalLight
        : SRC.horizontal

  const aspect = variant === 'mark' ? 0.92 : 715 / 240
  const width = Math.round(height * aspect)

  return (
    <img
      src={src}
      alt="LeanChem"
      width={width}
      height={height}
      className={`block object-contain object-left ${className}`}
      decoding="async"
    />
  )
}

/** Compact mark-only logo for tight spaces. */
export function LeanChemMark({
  className = '',
  size = 32,
}: {
  className?: string
  size?: number
}) {
  return (
    <LeanChemLogo variant="mark" height={size} className={className} />
  )
}
