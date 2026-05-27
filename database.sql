-- SPINVIRAL+ MASTER DATABASE ARCHITECTURE
-- Generated: May 26, 2026 | 07:57 PM CDT

-- 1. ADVERTISER INVENTORY & TRACKING
CREATE TABLE ad_inventory (
    id SERIAL PRIMARY KEY,
    brand_name VARCHAR(100),
    image_url TEXT,
    target_url TEXT,
    total_impressions INTEGER DEFAULT 0,
    target_impressions INTEGER DEFAULT 10000,
    is_active BOOLEAN DEFAULT TRUE,
    is_seed BOOLEAN DEFAULT FALSE -- Tag for our 20 'Social Proof' ads
);

-- 2. USER REVENUE & STATS (The $2.99 Feature)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    daily_spins INTEGER DEFAULT 5,
    bonus_spins INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    bonus_share_used BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE, -- Set TRUE if they pay the $2.99
    last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. THE VIRAL CLICK-BACK LOG
CREATE TABLE referral_clicks (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER REFERENCES users(id),
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BROADCASTS FROM THE ABYSS
CREATE TABLE megaphone_submissions (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    message_body VARCHAR(280),
    is_seed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. SEEDED DATA INJECTION (Kickstart your growth)
INSERT INTO ad_inventory (brand_name, image_url, is_seed) VALUES 
('Aurelius Jets', 'https://cdn.spinviral.plus/seed/jet.jpg', TRUE),
('Noir Couture', 'https://cdn.spinviral.plus/seed/fashion.jpg', TRUE),
('Apex Chrono', 'https://cdn.spinviral.plus/seed/watch.jpg', TRUE);

INSERT INTO megaphone_submissions (username, message_body, is_seed) VALUES 
('@LondonLogic', 'The abyss is only dark if we don''t speak into it.', TRUE),
('@NeoTokyo_99', 'Neon nights and digital heights. Spin forever.', TRUE);
