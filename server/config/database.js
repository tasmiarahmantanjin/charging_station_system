import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";

const pool = new Pool({
  user: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || 123456,
  database: process.env.DB_NAME || "charging_station_system",
  host: process.env.DB_HOST || "db", // localhost for if not using docker/testing
  port: process.env.DB_PORT || 5432, // 5433 for testing
});

pool.on("connection", (connection) => {
  connection.on("error", (error) => {
    console.error("Database error:", error.message);
  });
});

export default pool;
