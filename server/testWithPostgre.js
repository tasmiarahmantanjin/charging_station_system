const { Pool } = require("pg");
const express = require("express");
const bodyParser = require("body-parser");

const pool = new Pool({
  user: "your_user",
  host: "localhost",
  database: "your_database",
  password: "your_password",
  port: 5432,
});

app.use(bodyParser.json());

app.get("/companies", async (req, res) => {
  try {
    const companies = await pool.query("SELECT * FROM companies");
    res.status(200).json(companies.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/companies", async (req, res) => {
  const { name } = req.body;
  try {
    const newCompany = await pool.query(
      "INSERT INTO companies (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(newCompany.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/stations", async (req, res) => {
  try {
    const stations = await pool.query("SELECT * FROM stations");
    res.status(200).json(stations.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/stations", async (req, res) => {
  const { companyId, name, typeId } = req.body;
  try {
    const newStation = await pool.query(
      "INSERT INTO stations (company_id, name, type_id) VALUES ($1, $2, $3) RETURNING *",
      [companyId, name, typeId]
    );
    res.status(201).json(newStation.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/station-types", async (req, res) => {
  try {
    const stationTypes = await pool.query("SELECT * FROM station_types");
    res.status(200).json(stationTypes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/station-types", async (req, res) => {
  const { name, maxPower } = req.body;
  try {
    const newStationType = await pool.query(
      "INSERT INTO station_types (name, max_power) VALUES ($1, $2) RETURNING *",
      [name, maxPower]
    );
    res.status(201).json(newStationType.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");
const app = express();
const port = 3000;
const connectionString =
  "postgres://postgres:password@localhost:5432/station_management";

app.use(bodyParser.json());

const dbClient = new Client({
  connectionString: connectionString,
});
dbClient.connect();

// GET endpoint for getting all companies
app.get("/companies", async (req, res) => {
  try {
    const result = await dbClient.query("SELECT * FROM companies");
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving companies from database.");
  }
});

// GET endpoint for getting a company by ID
app.get("/companies/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await dbClient.query("SELECT * FROM companies WHERE id=$1", [
      id,
    ]);
    if (result.rows.length > 0) {
      res.send(result.rows[0]);
    } else {
      res.status(404).send(`Company with ID ${id} not found.`);
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(`Error retrieving company with ID ${id} from database.`);
  }
});

// POST endpoint for creating a new company
app.post("/companies", async (req, res) => {
  const { name } = req.body;
  try {
    const result = await dbClient.query(
      "INSERT INTO companies (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating company in database.");
  }
});

// PUT endpoint for updating a company
app.put("/companies/:id", async (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  try {
    const result = await dbClient.query(
      "UPDATE companies SET name=$1 WHERE id=$2 RETURNING *",
      [name, id]
    );
    if (result.rows.length > 0) {
      res.send(result.rows[0]);
    } else {
      res.status(404).send(`Company with ID ${id} not found.`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error updating company with ID ${id} in database.`);
  }
});

// DELETE endpoint for deleting a company
app.delete("/companies/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await dbClient.query(
      "DELETE FROM companies WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rows.length > 0) {
      res.send(`Company with ID ${id} deleted.`);
    } else {
      res.status(404).send(`Company with ID ${id} not found.`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error deleting company with ID ${id} from database.`);
  }
});
