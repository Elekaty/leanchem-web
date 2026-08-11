export type UserTier = 1 | 2 | 3;

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export type PricingStatus = 'Available' | 'Unavailable' | 'Tier1Locked';

export type TimelineStatus = 'Complete' | 'Active' | 'Pending' | 'Action_Required';

export type ActionTaskType = 'Upload_Receipt' | 'Sign_Doc';

export type HazardPictogram = 'flammable' | 'corrosive' | 'toxic' | 'irritant' | 'health' | 'environment';

export interface Product {
  id: string;
  name: string;
  casNumber: string;
  purity: string;
  moq: string;
  physicalState: string;
  packaging: string;
  leadTime: string;
  estimatedPrice: number | null;
  hazard: HazardPictogram;
  sdsUrl: string;
  sdsUpdatedAt: string;
  category: string;
}

export interface OrderTimelineStep {
  id: string;
  label: string;
  status: TimelineStatus;
  timestamp?: string;
  taskType?: ActionTaskType;
}

export interface Order {
  id: string;
  productName: string;
  casNumber: string;
  placedAt: string;
  steps: OrderTimelineStep[];
}

export interface UserSession {
  tier: UserTier;
  verificationStatus: VerificationStatus;
  displayName: string;
  roleLabel: string;
  siteLabel: string;
  isLoggedIn: boolean;
}