const express = require("express");
const router = express.Router();
const db = require("../db");
const crypto = require("crypto");

router.post("/generate", async (req, res) => {
    const { firstname, lastname, email } = req.body;

    if (!firstname || !lastname || !email) {
        return res.status(400).json({ success: false, error: "All fields required" });
    }

    try {
        const generatedKey = crypto.randomBytes(20).toString("hex");
        const outofdate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const now = new Date();

        // Simpan user dulu
        const [result] = await db.query("INSERT INTO user (firstname, lastname, email) VALUES (?, ?, ?)", [firstname, lastname, email]);
        const userId = result.insertId;

        // Simpan api_key dengan isi status, active_date, last_update
        await db.query("INSERT INTO api_key (`keys`, outofdate, user_id, status, active_date, last_update) VALUES (?, ?, ?, ?, ?, ?)", 
            [generatedKey, outofdate, userId, "active", now, now]);

        return res.json({
            success: true,
            key: generatedKey
        });
    } catch (error) {
        console.error("Generate API key error:", error);
        return res.status(500).json({ success: false, error: "Database error during API key generation" });
    }
});

module.exports = router;
