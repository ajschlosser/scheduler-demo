const mysql = require('mysql');

let dbConfig = {
  host: process.env.SCHEDULER_DEMO_MYSQL_HOST || 'localhost',
  user: process.env.SCHEDULER_DEMO_MYSQL_USER,
  password: process.env.SCHEDULER_DEMO_MYSQL_PASSWORD,
  database: process.env.SCHEDULER_DEMO_MYSQL_DATABASE
};

const connection = mysql.createPool(dbConfig);

module.exports = {
  query: q => {
    return new Promise((resolve, reject) => {
      // Uncomment to log every MySQL query
      console.log(`MySQL: "${q}"`);
      connection.query(q, (e, r, f) => {
        if (e) reject(e);
        else resolve(r, f);
      });
    });
  }
};