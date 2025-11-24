const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Vm.fidzz22",
    database: "api_db",
    port: 3308
});

db.connect(err => {
    if (err) {
        console.error("❌ Failed to connect to database:", err);
        return;
    }
    console.log("✅ Connected to database api_db");

    // Alter table to add new columns if they don't exist
    const queries = [
        "ALTER TABLE api_key ADD COLUMN IF NOT EXISTS status VARCHAR(50)",
        "ALTER TABLE api_key ADD COLUMN IF NOT EXISTS active_date DATETIME",
        "ALTER TABLE api_key ADD COLUMN IF NOT EXISTS last_update DATETIME"
    ];

    queries.forEach((query) => {
        db.query(query, (err, results) => {
            if (err) {
                // Some MySQL versions don't support IF NOT EXISTS in ALTER TABLE, so handle with a warning
                if (err.code === '1060') {
                    console.log(`⚠️ Column already exists: ${query}`);
                } else {
                    console.error(`❌ Error executing query "${query}":`, err);
                }
            } else {
                console.log(`✅ Executed: ${query}`);
            }
        });
    });

    db.end();
});
