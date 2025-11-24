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

const adminTable = `
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
)
`;

db.query(adminTable, (err) => {
    if (err) console.error("❌ Error membuat tabel admin:", err);
    else console.log("✅ Tabel 'admin' siap!");
    db.end();
});