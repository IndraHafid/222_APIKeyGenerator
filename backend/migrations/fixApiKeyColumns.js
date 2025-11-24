const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Vm.fidzz22",
    database: "api_db",
    port: 3308
});

db.connect(async err => {
    if (err) {
        console.error("❌ Failed to connect to database:", err);
        return;
    }
    console.log("✅ Connected to database api_db");

    // Fungsi untuk cek apakah kolom ada
    function columnExists(table, column) {
        return new Promise((resolve, reject) => {
            const query = `SHOW COLUMNS FROM \`${table}\` LIKE ?`;
            db.query(query, [column], (err, results) => {
                if (err) reject(err);
                resolve(results.length > 0);
            });
        });
    }

    try {
        const table = "api_key";

        const statusExists = await columnExists(table, "status");
        if (!statusExists) {
            await new Promise((resolve, reject) => {
                db.query(`ALTER TABLE \`${table}\` ADD COLUMN status VARCHAR(50)`, (err) => {
                    if (err) reject(err);
                    console.log(`✅ Added column 'status'`);
                    resolve();
                });
            });
        } else {
            console.log(`⚠️ Column 'status' already exists`);
        }

        const activeDateExists = await columnExists(table, "active_date");
        if (!activeDateExists) {
            await new Promise((resolve, reject) => {
                db.query(`ALTER TABLE \`${table}\` ADD COLUMN active_date DATETIME`, (err) => {
                    if (err) reject(err);
                    console.log(`✅ Added column 'active_date'`);
                    resolve();
                });
            });
        } else {
            console.log(`⚠️ Column 'active_date' already exists`);
        }

        const lastUpdateExists = await columnExists(table, "last_update");
        if (!lastUpdateExists) {
            await new Promise((resolve, reject) => {
                db.query(`ALTER TABLE \`${table}\` ADD COLUMN last_update DATETIME`, (err) => {
                    if (err) reject(err);
                    console.log(`✅ Added column 'last_update'`);
                    resolve();
                });
            });
        } else {
            console.log(`⚠️ Column 'last_update' already exists`);
        }
    } catch (error) {
        console.error("❌ Error during migration fix:", error);
    } finally {
        db.end();
    }
});
