-- LeanChem Phase 1 seed data
-- Demo company (verified), pending company, catalog products, sample order

INSERT INTO companies (id, name, tin_number, verification_status, legacy_import_key)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'LeanChem Demo Buyer PLC', 'TIN-ET-10001', 'verified', 'demo-verified'),
    ('22222222-2222-2222-2222-222222222222', 'Pending Chem Imports LLC', 'TIN-ET-10002', 'pending', 'demo-pending');

-- Password for both users: DemoPass123!
-- bcrypt hash generated at seed time by server if needed; placeholder replaced by seed script.
-- Using a known bcrypt hash for "DemoPass123!" (cost 10):
INSERT INTO users (id, company_id, email, password_hash, role, is_active)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'buyer@leanchem.demo',
        '$2b$12$4fWQG0ZAd5FbraBbSXbjx.ou0FNEJe3PL6CTOAHXooB.lyp7q.UEq',
        'super_admin',
        true
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        'pending@leanchem.demo',
        '$2b$12$4fWQG0ZAd5FbraBbSXbjx.ou0FNEJe3PL6CTOAHXooB.lyp7q.UEq',
        'super_admin',
        true
    );

INSERT INTO products (
    id, legacy_import_key, name, sku, description,
    cas_number, chemical_formula, purity_grade, physical_state, primary_hazard_code,
    in_stock, moq, moq_unit, lead_time_days, estimated_price, price_currency, packaging_volumes
) VALUES
(
    'c0000001-0000-4000-8000-000000000001',
    'prod-001',
    'Sodium Hydroxide, Pellets, ACS Reagent Grade',
    'LC-NAOH-25',
    'Industrial procurement grade NaOH pellets for process chemistry.',
    '1310-73-2', 'NaOH', '>=98%', 'Solid', 'GHS05',
    true, 25, 'kg', 7, 42.50, 'USD', '25 kg drum / 500 kg IBC'
),
(
    'c0000001-0000-4000-8000-000000000002',
    'prod-002',
    'Isopropyl Alcohol, Anhydrous, HPLC Grade',
    'LC-IPA-20',
    'Anhydrous IPA for HPLC and precision cleaning.',
    '67-63-0', 'C3H8O', '>=99.9%', 'Liquid', 'GHS02',
    true, 20, 'L', 4, 18.75, 'USD', '20 L jerrican / 200 L drum'
),
(
    'c0000001-0000-4000-8000-000000000003',
    'prod-003',
    'Acetone, ACS Reagent, Low Water Content for Precision Cleaning Applications',
    'LC-ACE-200',
    'Low-water acetone for industrial cleaning applications.',
    '67-64-1', 'C3H6O', '>=99.5%', 'Liquid', 'GHS02',
    true, 200, 'L', 9, NULL, 'USD', '200 L drum / ISO tank'
),
(
    'c0000001-0000-4000-8000-000000000004',
    'prod-004',
    'Hydrochloric Acid, 37% Technical Grade',
    'LC-HCL-1000',
    'Technical grade HCl for bulk industrial use.',
    '7647-01-0', 'HCl', '36-38%', 'Liquid', 'GHS05',
    true, 1000, 'L', 12, 0.85, 'USD', 'IBC tote / bulk tanker'
),
(
    'c0000001-0000-4000-8000-000000000005',
    'prod-005',
    'Toluene, Industrial Grade for Coatings & Adhesives',
    'LC-TOL-200',
    'Industrial toluene for coatings and adhesives manufacturing.',
    '108-88-3', 'C7H8', '>=99%', 'Liquid', 'GHS08',
    true, 200, 'L', 5, 22.10, 'USD', '200 L drum'
),
(
    'c0000001-0000-4000-8000-000000000006',
    'prod-006',
    'Hydrogen Peroxide, 35% Stabilized',
    'LC-H2O2-30',
    'Stabilized hydrogen peroxide for oxidation processes.',
    '7722-84-1', 'H2O2', '35%', 'Liquid', 'GHS05',
    true, 30, 'L', 8, 31.40, 'USD', '30 L HDPE drum'
),
(
    'c0000001-0000-4000-8000-000000000007',
    'prod-007',
    'Methanol, Absolute, ACS Spectrophotometric Grade',
    'LC-MEOH-20',
    'Absolute methanol for spectrophotometric applications.',
    '67-56-1', 'CH3OH', '>=99.8%', 'Liquid', 'GHS06',
    true, 20, 'L', 4, 14.20, 'USD', '20 L jerrican / 200 L drum'
),
(
    'c0000001-0000-4000-8000-000000000008',
    'prod-008',
    'Calcium Chloride Anhydrous, Food Processing Grade',
    'LC-CACL2-50',
    'Anhydrous calcium chloride for food processing applications.',
    '10043-52-4', 'CaCl2', '>=94%', 'Solid', 'GHS07',
    true, 50, 'kg', 10, 9.60, 'USD', '25 kg bag / 1,000 kg bulk bag'
);

INSERT INTO product_documents (product_id, document_type, file_url, last_updated) VALUES
('c0000001-0000-4000-8000-000000000001', 'SDS', '/docs/sds/naoh.pdf', '2026-03-12'),
('c0000001-0000-4000-8000-000000000002', 'SDS', '/docs/sds/ipa.pdf', '2026-01-28'),
('c0000001-0000-4000-8000-000000000003', 'SDS', '/docs/sds/acetone.pdf', '2025-11-04'),
('c0000001-0000-4000-8000-000000000004', 'SDS', '/docs/sds/hcl.pdf', '2026-02-19'),
('c0000001-0000-4000-8000-000000000005', 'SDS', '/docs/sds/toluene.pdf', '2026-04-01'),
('c0000001-0000-4000-8000-000000000006', 'SDS', '/docs/sds/h2o2.pdf', '2025-12-15'),
('c0000001-0000-4000-8000-000000000007', 'SDS', '/docs/sds/meoh.pdf', '2026-05-22'),
('c0000001-0000-4000-8000-000000000008', 'SDS', '/docs/sds/cacl2.pdf', '2026-02-08');

INSERT INTO sample_requests (product_id, user_id, status)
VALUES ('c0000001-0000-4000-8000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'requested');

INSERT INTO orders (id, company_id, requested_by, status, delivery_address, internal_notes, created_at)
VALUES (
    'd0000001-0000-4000-8000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'delivering',
    'Main HQ Warehouse, Addis Ababa, Ethiopia',
    'Include CoA on dispatch.',
    '2026-07-28T09:14:00Z'
);

INSERT INTO order_items (order_id, product_id, requested_quantity, packaging_preference)
VALUES (
    'd0000001-0000-4000-8000-000000000001',
    'c0000001-0000-4000-8000-000000000002',
    40,
    '20 L jerrican'
);

INSERT INTO orders (id, company_id, requested_by, status, delivery_address, created_at)
VALUES (
    'd0000001-0000-4000-8000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'verified',
    'Main HQ Warehouse, Addis Ababa, Ethiopia',
    '2026-07-12T16:40:00Z'
);

INSERT INTO order_items (order_id, product_id, requested_quantity, packaging_preference)
VALUES (
    'd0000001-0000-4000-8000-000000000002',
    'c0000001-0000-4000-8000-000000000001',
    50,
    '25 kg drum'
);
