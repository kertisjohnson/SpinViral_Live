/**
 * SPINVIRAL+ MASTER BACKEND ENGINE
 * Current Version: 1.0.2 (Production Ready)
 * Date: May 26, 2026
 */

const express = require('express');
const app = express();
const { Pool } = require('pg'); // PostgreSQL for the 'Vault'
const helmet = require('helmet'); // Security layer
const cors = require('cors');

// 1. DATABASE CONNECTION (Using the 'database.sql' blueprint)
const db = new Pool({
  connectionString: process.env.DATABASE_URL, // Provided by your host (Railway/Vercel)
  ssl: { rejectUnauthorized: false }
});

app.use(helmet());
app.use(cors());
app.use(express.json());

// 2. THE LAG-BALANCER (Fair Ad Rotation)
// Ensures all advertisers reach their 10k goal equally
app.get('/api/get-ads', async (req, res) => {
    try {
        const adResult = await db.query(`
            SELECT id, brand_name, image_url, target_url 
            FROM ad_inventory 
            WHERE is_active = TRUE 
            ORDER BY total_impressions ASC, RANDOM() 
            LIMIT 3
        `);

        // Log the impressions for these 3 specific ads
        const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        for (let ad of adResult.rows) {
            await db.query(
                "INSERT INTO impression_logs (ad_id, ip_hash) VALUES ($1, encode(digest($2, 'sha256'), 'hex'))",
                [ad.id, userIP]
            );
            await db.query("UPDATE ad_inventory SET total_impressions = total_impressions + 1 WHERE id = $1", [ad.id]);
        }

        res.json(adResult.rows);
    } catch (err) {
        res.status(500).json({ error: "Abyss Connection Failed" });
    }
});

// 3. THE VIRAL CLICK-BACK (Granting Bonus Spins)
app.get('/ref/:referrerId', async (req, res) => {
    const { referrerId } = req.params;
    const friendIP = req.ip;

    try {
        // Check for 'Free Riders' - ensure this IP hasn't clicked a ref link today
        const check = await db.query(
            "SELECT id FROM referral_clicks WHERE ip_address = $1 AND created_at > NOW() - INTERVAL '24 hours'",
            [friendIP]
        );

        if (check.rows.length === 0) {
            // Success: Log the click and grant +2 Spins to the original user
            await db.query("INSERT INTO referral_clicks (referrer_id, ip_address) VALUES ($1, $2)", [referrerId, friendIP]);
            await db.query("UPDATE users SET bonus_spins = bonus_spins + 2 WHERE id = $1", [referrerId]);
        }

        // Redirect the new friend to the app to start their journey
        res.redirect('/');
    } catch (err) {
        res.redirect('/');
    }
});

// 4. THE MIDNIGHT RESET LOGIC
// This runs as a 'Cron Job' at 00:00 CDT
app.post('/internal/midnight-reset', async (req, res) => {
    // Only allow authorized internal calls
    if (req.headers['x-api-key'] !== process.env.CRON_KEY) return res.status(403).end();

    try {
        await db.query("UPDATE users SET daily_spins = 5, bonus_share_used = FALSE");
        console.log("Midnight Reset Complete: " + new Date().toISOString());
        res.json({ success: true });
    } catch (err) {
        res.status(500).end();
    }
});

// 5. WORDS FROM AFAR (Random Broadcast Fetch)
app.get('/api/broadcast', async (req, res) => {
    const result = await db.query("SELECT message_body, username FROM megaphone_submissions ORDER BY RANDOM() LIMIT 1");
    res.json(result.rows[0]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SpinViral+ Engine humming on port ${PORT}`));