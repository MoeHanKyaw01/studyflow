import mysql from "mysql2/promise";

const pool =
  globalThis.studyflowPool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3307),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    dateStrings: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.studyflowPool = pool;
}

export default pool;