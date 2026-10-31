DO $$
DECLARE
    v_store_count INT;
    v_store_id UUID;
    v_store_warkop UUID;
    -- Ingredient IDs (Store 1: Warung Kopi & Rasa Nusantara)
    v_ing_kopi UUID; v_ing_susu UUID; v_ing_gula UUID; v_ing_cup UUID;
    v_ing_ayam UUID; v_ing_beras UUID; v_ing_minyak UUID; v_ing_cabai UUID; v_ing_telur UUID;
    -- Menu IDs (Store 1)
    v_menu_kopsu UUID; v_menu_americano UUID; v_menu_geprek UUID; v_menu_nasgor UUID;
    -- Ingredient IDs (Store 2: Warkop Ceria Bingit)
    v_w_ayam UUID; v_w_cabe UUID; v_w_sapi UUID; v_w_es UUID; v_w_kecap UUID; v_w_teh UUID;
    -- Menu IDs (Store 2)
    v_w_m_geprek UUID; v_w_m_dendeng UUID; v_w_m_esteh UUID; v_w_m_estehjumbo UUID;
BEGIN
    -- Cek apakah sudah ada data store
    SELECT COUNT(*) INTO v_store_count FROM stores;

    -- Jalankan seed HANYA JIKA tabel stores masih kosong (0)
    IF v_store_count = 0 THEN

        -- 1. Create Default Store (Prototype Main)
        INSERT INTO stores (id, store_name, target_margin)
        VALUES ('c8d0975d-1a2b-4c3d-9e8f-112233445566', 'Kopi Kenangan Pahit', 0.40)
        RETURNING id INTO v_store_id;

        -- 2. Insert Ingredients for Kopi Kenangan Pahit
        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_id, 'Kopi Biji Robusta Roast', 85000, 'kg', 1000) RETURNING id INTO v_ing_kopi;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_id, 'Susu Fresh UHT Full Cream', 19500, 'liter', 1000) RETURNING id INTO v_ing_susu;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_id, 'Gula Aren Cair Premium', 32000, 'liter', 1000) RETURNING id INTO v_ing_gula;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_id, 'Cup 14oz + Tutup + Sedotan', 30000, 'pcs', 50) RETURNING id INTO v_ing_cup;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_id, 'Ayam Segar Potong', 42000, 'kg', 1000) RETURNING id INTO v_ing_ayam;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_id, 'Beras Pulen Super', 75000, 'kg', 5000) RETURNING id INTO v_ing_beras;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_id, 'Minyak Goreng Sawit', 36000, 'liter', 2000) RETURNING id INTO v_ing_minyak;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_id, 'Cabai Rawit Merah', 55000, 'kg', 1000) RETURNING id INTO v_ing_cabai;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_id, 'Telur Ayam Ras', 28000, 'pcs', 16) RETURNING id INTO v_ing_telur;

        -- 3. Insert Menu Items for Kopi Kenangan Pahit
        INSERT INTO menu_items (store_id, name, selling_price, category)
        VALUES (v_store_id, 'Es Kopi Susu Gula Aren', 18000, 'Minuman') RETURNING id INTO v_menu_kopsu;

        INSERT INTO menu_items (store_id, name, selling_price, category)
        VALUES (v_store_id, 'Iced Americano', 12000, 'Minuman') RETURNING id INTO v_menu_americano;

        INSERT INTO menu_items (store_id, name, selling_price, category)
        VALUES (v_store_id, 'Ayam Geprek + Nasi Sambal Bawang', 20000, 'Makanan') RETURNING id INTO v_menu_geprek;

        INSERT INTO menu_items (store_id, name, selling_price, category)
        VALUES (v_store_id, 'Nasi Goreng Spesial Telur', 16000, 'Makanan') RETURNING id INTO v_menu_nasgor;

        -- 4. Insert Recipe Ingredients
        INSERT INTO recipe_ingredients (menu_id, ingredient_id, quantity_used)
        VALUES
            (v_menu_kopsu, v_ing_kopi, 18),
            (v_menu_kopsu, v_ing_susu, 120),
            (v_menu_kopsu, v_ing_gula, 25),
            (v_menu_kopsu, v_ing_cup, 1),
            (v_menu_americano, v_ing_kopi, 18),
            (v_menu_americano, v_ing_cup, 1),
            (v_menu_geprek, v_ing_ayam, 160),
            (v_menu_geprek, v_ing_beras, 100),
            (v_menu_geprek, v_ing_minyak, 50),
            (v_menu_geprek, v_ing_cabai, 30),
            (v_menu_nasgor, v_ing_beras, 120),
            (v_menu_nasgor, v_ing_telur, 1),
            (v_menu_nasgor, v_ing_minyak, 30),
            (v_menu_nasgor, v_ing_cabai, 15);

        -- 5. Create Store 2 (Warmindo Tunjungan)
        INSERT INTO stores (id, store_name, target_margin)
        VALUES ('4dad1268-5e6f-7a8b-9c0d-223344556677', 'Warmindo Tunjungan', 0.25);

        -- 6. Create Store 3 (Warkop Ceria Bingit - Default Demo Store)
        INSERT INTO stores (id, store_name, target_margin)
        VALUES ('e11c6a9e-9b0c-1d2e-3f4a-334455667788', 'Warkop Ceria Bingit', 0.30)
        RETURNING id INTO v_store_warkop;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_warkop, 'Ayam Mentah', 38000, 'kg', 1000) RETURNING id INTO v_w_ayam;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_warkop, 'Cabe Merah Besar', 60000, 'kg', 1000) RETURNING id INTO v_w_cabe;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_warkop, 'Daging Sapi', 150000, 'kg', 1000) RETURNING id INTO v_w_sapi;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_warkop, 'Es', 20000, 'pack', 50) RETURNING id INTO v_w_es;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_warkop, 'Kecap Bango', 10000, 'pack', 1) RETURNING id INTO v_w_kecap;

        INSERT INTO ingredients (store_id, name, purchase_price, purchase_unit, unit_capacity)
        VALUES (v_store_warkop, 'Teh Tubruk', 20000, 'pack', 50) RETURNING id INTO v_w_teh;

        INSERT INTO menu_items (store_id, name, selling_price, category)
        VALUES (v_store_warkop, 'Ayam Geprek', 12000, 'Makanan') RETURNING id INTO v_w_m_geprek;

        INSERT INTO menu_items (store_id, name, selling_price, category)
        VALUES (v_store_warkop, 'Dendeng', 15000, 'Makanan') RETURNING id INTO v_w_m_dendeng;

        INSERT INTO menu_items (store_id, name, selling_price, category)
        VALUES (v_store_warkop, 'Es Teh', 2000, 'Minuman') RETURNING id INTO v_w_m_esteh;

        INSERT INTO menu_items (store_id, name, selling_price, category)
        VALUES (v_store_warkop, 'Es Teh Jumbo', 5000, 'Minuman') RETURNING id INTO v_w_m_estehjumbo;

        INSERT INTO recipe_ingredients (menu_id, ingredient_id, quantity_used)
        VALUES
            (v_w_m_geprek, v_w_ayam, 165),
            (v_w_m_dendeng, v_w_sapi, 50),
            (v_w_m_dendeng, v_w_cabe, 20),
            (v_w_m_dendeng, v_w_es, 1),
            (v_w_m_esteh, v_w_teh, 1),
            (v_w_m_esteh, v_w_es, 1),
            (v_w_m_estehjumbo, v_w_teh, 2.5),
            (v_w_m_estehjumbo, v_w_es, 2.5);

        RAISE NOTICE 'Seed data berhasil dimasukkan.';
    ELSE
        RAISE NOTICE 'Database sudah terisi data. Seed dilewati.';
    END IF;
END $$;

