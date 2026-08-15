import type { SVGProps } from 'react'
import type { HazardPictogram } from '../types/catalog'

type IconProps = SVGProps<SVGSVGElement>

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3.5 21.5 20H2.5L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M12 10v4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="17.25" r="1" fill="currentColor" />
    </svg>
  )
}

export function DocumentIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7 3.5h7l4 4V20.5H7V3.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M14 3.5v4h4" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M9.5 12h5M9.5 15.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true" {...props}>
      <rect x="5" y="10" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 10V7.5a4 4 0 0 1 8 0V10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true" {...props}>
      <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true" {...props}>
      <path
        d="m7 10 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 5h2l1.2 10.2a1.5 1.5 0 0 0 1.5 1.3h8.6a1.5 1.5 0 0 0 1.5-1.25L20 8H8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.25" fill="currentColor" />
      <circle cx="17" cy="20" r="1.25" fill="currentColor" />
    </svg>
  )
}

export function UploadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 16V5M8.5 8.5 12 5l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 19h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" aria-hidden="true" {...props}>
      <path
        d="m5 12 5 5 9-9"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const HAZARD_LABELS: Record<HazardPictogram, string> = {
  flammable: 'Flammable',
  corrosive: 'Corrosive',
  toxic: 'Toxic',
  irritant: 'Irritant',
  health: 'Health hazard',
  environment: 'Environmental hazard',
}

export function CategoryGlyph({ category, ...props }: IconProps & { category: string }) {
  const family = category.toLowerCase()
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" {...props}>
      <rect width="64" height="64" rx="6" fill="#EEF4FA" stroke="#7B8DC6" strokeWidth="1" />
      {family.includes('solvent') || family.includes('liquid') ? (
        <>
          <path d="M22 18h20v28H22z" fill="#1E5897" opacity="0.15" />
          <path d="M24 22h16v20H24z" stroke="#1E5897" strokeWidth="1.75" fill="none" />
          <path d="M24 34h16" stroke="#45ABEF" strokeWidth="8" opacity="0.5" />
        </>
      ) : family.includes('acid') ? (
        <>
          <path d="M32 16 44 44H20z" fill="#1E5897" opacity="0.12" />
          <path d="M32 18 42 42H22z" stroke="#1E5897" strokeWidth="1.75" fill="none" />
        </>
      ) : (
        <>
          <rect
            x="20"
            y="22"
            width="24"
            height="22"
            rx="2"
            stroke="#1E5897"
            strokeWidth="1.75"
            fill="none"
          />
          <path d="M24 22v-4h16v4" stroke="#1E5897" strokeWidth="1.75" />
          <path d="M28 30h8M28 36h8" stroke="#45ABEF" strokeWidth="1.75" />
        </>
      )}
    </svg>
  )
}

/** GHS-style diamond: red border, white face, black pictogram — high contrast at 24×24. */
export function HazardPictogramIcon({
  type,
  ...props
}: IconProps & { type: HazardPictogram }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width="24"
      height="24"
      role="img"
      aria-label={HAZARD_LABELS[type]}
      {...props}
    >
      <path d="M24 3 45 24 24 45 3 24Z" fill="#FFFFFF" stroke="#C8102E" strokeWidth="3.5" />
      {type === 'flammable' && (
        <path
          d="M24 12c2 4-2 6 0 10 3-2 6 1 6 5a6 6 0 1 1-12 0c0-5 4-8 6-15Z"
          fill="#000000"
        />
      )}
      {type === 'corrosive' && (
        <>
          <path d="M15 16h7v8H15zM26 16h7v8h-7z" fill="#000000" />
          <path d="M13 29h22l-3.5 7H16.5z" fill="#000000" />
        </>
      )}
      {type === 'toxic' && (
        <>
          <circle cx="24" cy="19" r="6.5" fill="#000000" />
          <path d="M17 28h14l-2.5 9h-9z" fill="#000000" />
          <circle cx="21.2" cy="18" r="1.3" fill="#FFFFFF" />
          <circle cx="26.8" cy="18" r="1.3" fill="#FFFFFF" />
        </>
      )}
      {type === 'irritant' && (
        <path
          d="M24 13v11M24 29.5v1M16 18l16 9M32 18 16 27"
          stroke="#000000"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      )}
      {type === 'health' && (
        <path d="M24 12c4.5 4.5 9 8 9 13.5a9 9 0 1 1-18 0C15 20 19.5 16.5 24 12Z" fill="#000000" />
      )}
      {type === 'environment' && (
        <>
          <path d="M12 28c5-9 19-9 24 0" stroke="#000000" strokeWidth="2.4" fill="none" />
          <circle cx="24" cy="21" r="4.5" fill="#000000" />
          <path d="M18 33h12" stroke="#000000" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}
