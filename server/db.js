const util = require('util');
const mysql = require('mysql');

const { catchHandler } = require('./util');

let dbConfig = {
  host: process.env.SCHEDULER_DEMO_MYSQL_HOST || 'localhost',
  user: process.env.SCHEDULER_DEMO_MYSQL_USER,
  password: process.env.SCHEDULER_DEMO_MYSQL_PASSWORD,
  database: process.env.SCHEDULER_DEMO_MYSQL_DATABASE
};

const connection = mysql.createPool(dbConfig);
const query = util.promisify(connection.query).bind(connection);

module.exports = {
  query: async q => {
      // Uncomment to log every MySQL query
      // console.log(`MySQL: "${q}"`);
      try
      {
        return await query(q);
      }
      catch (err)
      {
        catchHandler(err);
      }
  }
};