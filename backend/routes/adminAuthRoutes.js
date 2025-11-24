
const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;
const SECRET_KEY = "yourSecretKey123"; 

// ============================
// REGISTER ADMIN
// ============================
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {
        // Check if email already exists
const [existing] = await db.query(
            "SELECT * FROM admin WHERE email = ?",
            [email]
        );
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert admin
await db.query(
            "INSERT INTO admin (email, password) VALUES (?, ?)",
            [email, hashedPassword]
        );

        return res.json({
            success: true,
            message: "Admin registered successfully"
        });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// ============================
// LOGIN ADMIN
// ============================
router.post("/login", async (req, res) => {
    console.log("Login request body:", req.body);

    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: "Request body missing"
        });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {
const [rows] = await db.query(
            "SELECT * FROM admin WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const admin = rows[0];

        // Check password
        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // CREATE JWT TOKEN
        const token = jwt.sign(
            { adminId: admin.id }, 
            SECRET_KEY,
            { expiresIn: "2h" }
        );

        return res.json({
            success: true,
            message: "Login successful",
            token
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// ============================
// AUTH MIDDLEWARE
// ============================
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(403).json({ success: false, message: "Token missing" });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        req.admin = decoded;
        next();
    });
}

// ============================
// ADMIN DASHBOARD DATA ROUTE
// ============================
function formatDateToString(date) {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

router.get("/dashboard", authenticateAdmin, async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, firstname, lastname, email FROM user");
        const [keysRaw] = await db.query("SELECT id, `keys`, user_id, outofdate, status, active_date, last_update FROM api_key WHERE outofdate > NOW()");

        // Format the date fields
        const keys = keysRaw.map(k => ({
            ...k,
            active_date: formatDateToString(k.active_date),
            last_update: formatDateToString(k.last_update)
        }));

        return res.json({
            success: true,
            users,
            keys
        });
    } catch (err) {
        console.error("Dashboard fetch error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


// DELETE USER
router.delete("/deleteUser/:id", authenticateAdmin, async (req, res) => {
    const userId = req.params.id;
    try {
        console.log(`Attempting to delete API keys with user_id=${userId}`);
        // Delete all API keys related to this user first
        const [delKeysResult] = await db.query("DELETE FROM api_key WHERE user_id = ?", [userId]);
        console.log(`Deleted ${delKeysResult.affectedRows} API keys for user ${userId}`);

        // Delete the user with the given ID
        const [result] = await db.query("DELETE FROM user WHERE id = ?", [userId]);
        console.log(`Deleted user with id ${userId}, affectedRows=${result.affectedRows}`);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        console.error("Delete user error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// DELETE API KEY
router.delete("/deleteKey/:id", authenticateAdmin, async (req, res) => {
    const keyId = req.params.id;
    try {
        // Delete the API key with the given ID
const [result] = await db.query("DELETE FROM api_key WHERE id = ?", [keyId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "API key not found" });
        }
        res.json({ success: true, message: "API key deleted successfully" });
    } catch (err) {
        console.error("Delete API key error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// EXPORT ROUTER + MIDDLEWARE
router.authenticateAdmin = authenticateAdmin;
module.exports = router;
