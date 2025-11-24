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
        console.error("❌ Koneksi Gagal:", err);
        return;
    }
    console.log("✅ Terhubung ke database api_db di port 3308");
});

// ====== BUAT TABEL USER ======
const userTable = `
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    email VARCHAR(150)
)
`;

// ====== BUAT TABEL API_KEY ======
const apiKeyTable = `
CREATE TABLE IF NOT EXISTS api_key (
    id INT AUTO_INCREMENT PRIMARY KEY,
    \`keys\` VARCHAR(255),
    outofdate DATETIME,
    user_id INT,
    status VARCHAR(50),
    active_date DATETIME,
    last_update DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(id)
)
`

// EKSEKUSI
db.query(userTable, (err) => {
    if (err) console.error("❌ Error membuat tabel user:", err);
    else console.log("✅ Tabel 'user' siap!");
});

db.query(apiKeyTable, (err) => {
    if (err) console.error("❌ Error membuat tabel api_key:", err);
    else console.log("✅ Tabel 'api_key' siap!");
});

db.end();
