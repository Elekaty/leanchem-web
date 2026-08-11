import type { VerificationStatus } from '../../types';
import './VerificationBanner.css';

interface VerificationBannerProps {
  verificationStatus: VerificationStatus;
}

export const VERIFICATION_BANNER_ID = 'verification-banner';

export function VerificationBanner({ verificationStatus }: VerificationBannerProps) {
  if (verificationStatus !== 'pending') return null;

  return (
    <div
      id={VERIFICATION_BANNER_ID}
      className="verification-banner"
      role="status"
      aria-live="polite"
    >
      <p>
        Your account is pending verification. Ordering is restricted until compliance review is
        complete.
      </p>
    </div>
  );
}
