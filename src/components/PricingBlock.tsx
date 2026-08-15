import type { PricingStatus } from '../types/catalog'
import { LockIcon } from './Icons'

interface PricingBlockProps {
  price: number | null
  status: PricingStatus
  onPrimaryAction?: () => void
  onSampleAction?: () => void
  submitError?: string | null
  sampleExhausted?: boolean
  isSubmitting?: boolean
  primaryLabel?: string
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

export function PricingBlock({
  price,
  status,
  onPrimaryAction,
  onSampleAction,
  submitError,
  sampleExhausted = false,
  isSubmitting = false,
  primaryLabel,
}: PricingBlockProps) {
  const availableLabel = primaryLabel ?? 'Submit Order Request'

  return (
    <div className="flex flex-col gap-3">
      {status === 'Available' && price != null ? (
        <div>
          <p className="text-2xl font-bold text-lapis">
            {formatPrice(price)}
            <span className="text-sm font-semibold text-velvet/55"> Est.</span>
          </p>
          <p className="text-xs text-velvet/55">excludes freight &amp; duties</p>
        </div>
      ) : null}

      {status === 'Unavailable' ? (
        <p className="text-2xl font-bold text-velvet/40">—</p>
      ) : null}

      {status === 'Tier1Locked' ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-velvet/70">
          <LockIcon />
          <span>Pricing available after authentication</span>
        </div>
      ) : null}

      {submitError ? (
        <p className="text-sm font-semibold text-error" aria-live="assertive" role="alert">
          {submitError}
        </p>
      ) : null}

      {status === 'Available' ? (
        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={onPrimaryAction}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting…' : availableLabel}
        </button>
      ) : null}

      {status === 'Unavailable' ? (
        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={onPrimaryAction}
          disabled={isSubmitting}
        >
          Request Custom Quote
        </button>
      ) : null}

      {status === 'Tier1Locked' ? (
        <button type="button" className="btn btn-primary w-full" onClick={onPrimaryAction}>
          Log In or Register for Pricing
        </button>
      ) : null}

      {sampleExhausted ? (
        <button
          type="button"
          className="btn btn-secondary w-full"
          disabled
          tabIndex={-1}
          aria-disabled="true"
        >
          Sample Requested
        </button>
      ) : (
        <button type="button" className="btn btn-secondary w-full" onClick={onSampleAction}>
          Request Sample
        </button>
      )}
    </div>
  )
}
