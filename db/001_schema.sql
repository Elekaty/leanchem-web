-- LeanChem Phase 1 — PostgreSQL Schema
-- Identity, catalog, transactions, RLS, and utility triggers

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Module 1: Identity & Access
-- ---------------------------------------------------------------------------

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_import_key VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    tin_number VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'super_admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL
        CHECK (document_type IN ('business_license', 'tin_certificate')),
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Modules 2 & 3: Catalog, Discovery & Product Evaluation
-- ---------------------------------------------------------------------------

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_import_key VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    cas_number VARCHAR(50),
    chemical_formula VARCHAR(100),
    purity_grade VARCHAR(100),
    physical_state VARCHAR(50),
    primary_hazard_code VARCHAR(50),
    in_stock BOOLEAN DEFAULT false,
    moq INTEGER,
    moq_unit VARCHAR(50),
    lead_time_days INTEGER,
    estimated_price NUMERIC(10, 2),
    price_currency VARCHAR(10) DEFAULT 'USD',
    packaging_volumes VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_cas ON products(cas_number);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);

CREATE TABLE product_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    document_type VARCHAR(50) DEFAULT 'SDS',
    file_url TEXT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sample_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'requested'
        CHECK (status IN ('requested', 'dispatched', 'delivered')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_sample_per_user UNIQUE (product_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Modules 4 & 5: Transaction, Checkout & Tracking
-- ---------------------------------------------------------------------------

CREATE TYPE canonical_order_status AS ENUM (
    'draft',
    'request_submitted',
    'verified',
    'delivering',
    'fulfilled'
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id),
    status canonical_order_status DEFAULT 'request_submitted',
    delivery_address TEXT NOT NULL,
    internal_notes TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_orders_modtime
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    requested_quantity INTEGER NOT NULL,
    packaging_preference VARCHAR(100)
);

CREATE TABLE order_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    document_type VARCHAR(50) NOT NULL
        CHECK (document_type IN ('payment_receipt', 'final_invoice')),
    file_url TEXT NOT NULL,
    file_size_bytes INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Auth assumption: API sets request.jwt.claim.sub = users.id per request
-- UPDATE/DELETE on orders/items/statuses reserved for service roles (no end-user policies)
-- ---------------------------------------------------------------------------

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY read_all_products ON products
    FOR SELECT USING (true);

CREATE POLICY view_own_company_docs ON company_documents FOR SELECT
    USING (
        company_id = (
            SELECT company_id FROM users
            WHERE id = current_setting('request.jwt.claim.sub', true)::uuid
        )
    );

CREATE POLICY insert_own_company_docs ON company_documents FOR INSERT
    WITH CHECK (
        company_id = (
            SELECT company_id FROM users
            WHERE id = current_setting('request.jwt.claim.sub', true)::uuid
        )
    );

CREATE POLICY view_own_orders ON orders FOR SELECT
    USING (
        company_id = (
            SELECT company_id FROM users
            WHERE id = current_setting('request.jwt.claim.sub', true)::uuid
        )
    );

CREATE POLICY insert_own_orders ON orders FOR INSERT
    WITH CHECK (
        company_id = (
            SELECT company_id FROM users
            WHERE id = current_setting('request.jwt.claim.sub', true)::uuid
        )
    );

CREATE POLICY view_own_order_items ON order_items FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM orders
            WHERE company_id = (
                SELECT company_id FROM users
                WHERE id = current_setting('request.jwt.claim.sub', true)::uuid
            )
        )
    );

CREATE POLICY insert_own_order_items ON order_items FOR INSERT
    WITH CHECK (
        order_id IN (
            SELECT id FROM orders
            WHERE company_id = (
                SELECT company_id FROM users
                WHERE id = current_setting('request.jwt.claim.sub', true)::uuid
            )
        )
    );

CREATE POLICY view_own_order_docs ON order_documents FOR SELECT
    USING (
        order_id IN (
            SELECT id FROM orders
            WHERE company_id = (
                SELECT company_id FROM users
                WHERE id = current_setting('request.jwt.claim.sub', true)::uuid
            )
        )
    );

CREATE POLICY insert_own_order_docs ON order_documents FOR INSERT
    WITH CHECK (
        order_id IN (
            SELECT id FROM orders
            WHERE company_id = (
                SELECT company_id FROM users
                WHERE id = current_setting('request.jwt.claim.sub', true)::uuid
            )
        )
    );

CREATE POLICY view_own_samples ON sample_requests FOR SELECT
    USING (user_id = current_setting('request.jwt.claim.sub', true)::uuid);

CREATE POLICY insert_own_samples ON sample_requests FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claim.sub', true)::uuid);

-- Application roles (optional hardening for local/dev)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'leanchem_app') THEN
        CREATE ROLE leanchem_app LOGIN PASSWORD 'leanchem_app';
    END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO leanchem_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO leanchem_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO leanchem_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO leanchem_app;
