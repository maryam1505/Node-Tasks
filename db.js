import mysql from "mysql2";
// import MySQLStore from "express-mysql-session";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "practice_nodejs",
});



db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    return;
  }
  console.log("Connected to the MySQL database.");
});

// export const sessionStore = new MySQLStore({}, db);

export default db;