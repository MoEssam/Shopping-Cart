var mysql = require("mysql");

// Create a connection to the database
var connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT,
});

// open the MySQL connection
connection.connect((error) => {
  if (error) {
    console.log("error connecting: " + error.stack);
    return;
  }
  console.log(
    "Successfully connected to the database as id : " + connection.threadId
  );
});

module.exports = connection;
