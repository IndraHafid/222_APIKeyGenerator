const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Vm.fidzz22",
  database: "api_db",
  port: 3308   
});

module.exports = pool;
