import type { PricingStatus } from '../../types';
import { LockIcon } from '../Icons';
import './PricingBlock.css';

interface PricingBlockProps {
  price: number | null
  status: PricingStatus
  onPrimaryAction?: () => void
  onSampleAction?: () => void
  submitError?: string | null
  sampleExhausted?: boolean
  isSubmitting?: boolean
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
}: PricingBlockProps) {
  return (
    <div className="pricing-block">
      {status === 'Available' && price != null ? (
        <div className="pricing-block__price">
          <span className="pricing-block__amount">
            {formatPrice(price)}
            <span className="pricing-block__est"> Est.</span>
          </span>
          <span className="pricing-block__sub">excludes freight &amp; duties</span>
        </div>
      ) : null}

      {status === 'Unavailable' ? (
        <div className="pricing-block__price">
          <span className="pricing-block__amount pricing-block__amount--dash">—</span>
        </div>
      ) : null}

      {status === 'Tier1Locked' ? (
        <div className="pricing-block__locked">
          <LockIcon />
          <span>Pricing available after authentication</span>
        </div>
      ) : null}

      {submitError ? (
        <p className="pricing-block__error" aria-live="assertive" role="alert">
          {submitError}
        </p>
      ) : null}

      {status === 'Available' ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onPrimaryAction}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting…' : 'Submit Order Request'}
        </button>
      ) : null}

      {status === 'Unavailable' ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onPrimaryAction}
          disabled={isSubmitting}
        >
          Request Custom Quote
        </button>
      ) : null}

      {status === 'Tier1Locked' ? (
        <button type="button" className="btn btn-primary" onClick={onPrimaryAction}>
          Log In or Register for Pricing
        </button>
      ) : null}

      {sampleExhausted ? (
        <button
          type="button"
          className="btn btn-secondary pricing-block__sample"
          disabled
          tabIndex={-1}
          aria-disabled="true"
        >
          Sample Requested
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-secondary pricing-block__sample"
          onClick={onSampleAction}
        >
          Request Sample
        </button>
      )}
    </div>
  )
}
