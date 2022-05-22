const mysql = require("mysql");
require("dotenv").config({ path: '../.env' });

const dbConnection = function(){
  return (
    mysql.createConnection({ 
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD
    })
  )
}

module.exports = {
  dbConnection,
};