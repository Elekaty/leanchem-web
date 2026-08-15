/**
 * Curated industrial photography (Unsplash CDN).
 * Sized for web: w≈1600–1920, q=70–75 — always pair with a strong overlay.
 */
const u = (id: string, w = 1800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=72`

export const VISUALS = {
  /** Immersive warehouse / logistics corridor for homepage hero. */
  hero: u('photo-1586528116311-ad8dd3c8310d', 1920),
  /** Industrial process plant — atmospheric storytelling sections. */
  plant: u('photo-1513828583688-c526ac7cce4e', 1600),
  /** Port / container corridor for logistics narrative. */
  port: u('photo-1494412574643-ff11b023a2b0', 1600),
  /** Clean factory floor for industry / capability blocks. */
  factory: u('photo-1581092160562-40aa08e78837', 1600),
  /** Soft warehouse atmosphere for catalog page shell. */
  catalog: u('photo-1565793298595-6a879b1d9492', 1400),
} as const
