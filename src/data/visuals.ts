/**
 * Curated industrial photography (Unsplash CDN).
 * URLs verified via GET. Always pair with a strong overlay for text contrast.
 */
const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=72`

export const VISUALS = {
  /** Full-bleed warehouse aisle — homepage hero. */
  hero: u('photo-1553413077-190dd305871c', 1920),
  /** Logistics warehouse corridor. */
  warehouse: u('photo-1586528116311-ad8dd3c8310d', 1800),
  /** Industrial process piping / plant. */
  plant: u('photo-1504328345606-18bbc8c9d7d1', 1600),
  /** Port / container yard. */
  port: u('photo-1565008447742-97f6f38c985c', 1600),
  /** Factory production floor. */
  factory: u('photo-1581092160562-40aa08e78837', 1600),
  /** Soft warehouse for catalog page shell. */
  catalog: u('photo-1565793298595-6a879b1d9492', 1400),
  /** Bulk liquid / tank farm atmosphere. */
  drums: u('photo-1611273426858-450d8e3c9fce', 1600),
  /** Heavy industrial tanks / infrastructure. */
  tanks: u('photo-1473341304170-971dccb5ac1e', 1600),
  /** Inland freight / container corridor. */
  freight: u('photo-1578575437130-527eed3abbec', 1600),
  /** Clean lab / QC atmosphere. */
  lab: u('photo-1582719471384-894fbb16e074', 1400),
  /** Precision manufacturing floor. */
  manufacturing: u('photo-1581092918056-0c4c3acd3789', 1400),
} as const

/** Image map for industry capability cards. */
export const INDUSTRY_VISUALS: Record<string, string> = {
  'paints-coatings': VISUALS.factory,
  construction: VISUALS.plant,
  plastics: VISUALS.manufacturing,
  'water-treatment': VISUALS.drums,
}
