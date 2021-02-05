const mysql = require('mysql2');

const pool = mysql.createPool({
  user: 'root',
  password: 'd8.uCLjb',
  port: 3306,
  host: 'localhost',
  database: 'mvc_api_database'
});

module.exports = pool.promise();