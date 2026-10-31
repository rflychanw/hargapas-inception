-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- STORES TABLE
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name VARCHAR(255) NOT NULL,
    target_margin NUMERIC(5,2) DEFAULT 0.35, -- e.g. 0.35 = 35%
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INGREDIENTS TABLE
CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    purchase_price NUMERIC(12,2) NOT NULL, -- Wholesale purchase price
    purchase_unit VARCHAR(50) NOT NULL,    -- 'kg', 'liter', 'pcs'
    unit_capacity NUMERIC(12,2) NOT NULL,  -- Capacity (e.g. 1000 for 1000g)
    cost_per_unit NUMERIC(12,4) GENERATED ALWAYS AS (purchase_price / NULLIF(unit_capacity, 0)) STORED
);

-- MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    selling_price NUMERIC(12,2) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RECIPE INGREDIENTS TABLE (Junction Table)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity_used NUMERIC(12,2) NOT NULL -- Portion quantity
);

-- 1. TABEL SESI DISKUSI (Thread / Conversation Session)
CREATE TABLE IF NOT EXISTS advisor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- Diambil otomatis dari pertanyaan awal pengguna (misal: "Stok ayam melimpah...")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL PESAN DALAM SESI (Pesan User & Respon AI)
CREATE TABLE IF NOT EXISTS advisor_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES advisor_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT, -- Isi teks biasa jika role = 'user'

    -- Field khusus respon AI (role = 'assistant')
    friendly_advice TEXT,
    action_step TEXT,
    bundling_recommendations JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing untuk mempercepat query per toko dan per sesi
CREATE INDEX IF NOT EXISTS idx_advisor_sessions_store ON advisor_sessions(store_id);
CREATE INDEX IF NOT EXISTS idx_advisor_messages_session ON advisor_messages(session_id);

-- MATH ENGINE VIEW (DETERMINISTIC HPP, MARGIN, & MATRIX)
CREATE OR REPLACE VIEW view_menu_analysis AS
WITH calculated_hpp AS (
    SELECT
        m.id AS menu_id,
        m.store_id,
        m.name AS menu_name,
        m.category,
        m.selling_price,
        s.target_margin,
        COALESCE(SUM(ri.quantity_used * i.cost_per_unit), 0) AS total_hpp
    FROM menu_items m
    JOIN stores s ON m.store_id = s.id
    LEFT JOIN recipe_ingredients ri ON m.id = ri.menu_id
    LEFT JOIN ingredients i ON ri.ingredient_id = i.id
    GROUP BY m.id, m.store_id, m.name, m.category, m.selling_price, s.target_margin
)
SELECT
    menu_id,
    store_id,
    menu_name,
    category,
    selling_price,
    total_hpp,
    (selling_price - total_hpp) AS profit_amount,
    CASE
        WHEN selling_price > 0 THEN ROUND((selling_price - total_hpp) / selling_price, 4)
        ELSE 0
    END AS current_margin,
    CEIL(total_hpp / NULLIF((1 - target_margin), 0)) AS ideal_selling_price,
    CASE
        WHEN (selling_price - total_hpp) / NULLIF(selling_price, 0) >= target_margin THEN 'Star'
        ELSE 'Plowhorse'
    END AS matrix_status
FROM calculated_hpp;

