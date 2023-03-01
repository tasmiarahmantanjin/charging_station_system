// Required modules
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");

// Create connection to the database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "charging_station_system",
});

// Connect to the database
connection.connect((error) => {
  if (error) {
    console.error("Error connecting to the database: " + error.stack);
    return;
  }
  console.log("Connected to the database as id " + connection.threadId);
});

// Create an instance of Express.js
const app = express();
app.use(bodyParser.json());

// API for getting all companies
app.get("/companies", (req, res) => {
  const query = `SELECT * FROM companies`;
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

// API for creating a company
app.post("/companies", (req, res) => {
  const company = req.body;
  const query = `INSERT INTO companies(name) VALUES ('${company.name}')`;
  connection.query(query, (error, result) => {
    if (error) throw error;
    res.json({ id: result.insertId, ...company });
  });
});

// API for getting a company by ID
app.get("/companies/:id", (req, res) => {
  const companyId = req.params.id;
  const query = `SELECT * FROM companies WHERE id=${companyId}`;
  connection.query(query, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res
        .status(404)
        .json({ message: `Company with id ${companyId} not found` });
    }
  });
});

// API for updating a company by ID
app.put("/companies/:id", (req, res) => {
  const companyId = req.params.id;
  const company = req.body;
  const query = `UPDATE companies SET name='${company.name}' WHERE id=${companyId}`;
  connection.query(query, (error) => {
    if (error) throw error;
    res.json({ id: companyId, ...company });
  });
});

// API for deleting a company by ID
app.delete("/companies/:id", (req, res) => {
  const companyId = req.params.id;
  const query = `DELETE FROM companies WHERE id=${companyId}`;
  connection.query(query, (error) => {
    if (error) throw error;
    res.json({ message: `Company with id ${companyId} deleted` });
  });
});

// API for getting all station types
app.get("/station-types", (req, res) => {
  const query = `SELECT * FROM station_types`;
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

// API for creating a station type
app.post("/station-types", (req, res) => {
  const stationType = req.body;
  const query = `INSERT INTO station_types(name, max_power) VALUES ('${stationType.name}', ${stationType.maxPower})`;
  connection.query(query, (error, result) => {
    if (error) throw error;
    res.json({ id: result.insertId, ...stationType });
  });
});

// API for
// Import necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");

// Initialize app and middleware
const app = express();
app.use(bodyParser.json());

// Connect to database
const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "mysql",
});

// Define models
const Company = sequelize.define("Company", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const StationType = sequelize.define("StationType", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  maxPower: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

const Station = sequelize.define("Station", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Company.hasMany(Station);
Station.belongsTo(Company);
StationType.hasOne(Station);
Station.belongsTo(StationType);

// Define CRUD endpoints for managing stations, station types, companies
// TODO

// Define endpoint for retrieving data about stations belonging to a company
app.get("/companies/:companyId/stations", async (req, res) => {
  const companyId = req.params.companyId;

  // Find all child companies of the given company
  const childCompanies = await Company.findAll({
    where: {
      id: companyId,
    },
    include: [
      {
        model: Company,
        as: "childCompanies",
        hierarchy: true,
      },
    ],
  });

  // Find all stations belonging to the given company and its child companies
  const stations = await Station.findAll({
    where: {
      CompanyId: childCompanies.map((company) => company.id),
    },
    include: [
      {
        model: StationType,
        attributes: ["maxPower"],
      },
    ],
  });

  // Format response data as stationId, stationName, maxPower
  const responseData = stations.map((station) => ({
    stationId: station.id,
    stationName: station.name,
    maxPower: station.StationType.maxPower,
  }));

  res.json(responseData);
});

// Define script parser endpoint
app.post("/parser", (req, res) => {
  const script = req.body.script;
  const steps = parseScript(script);
  const response = executeSteps(steps);

  res.json(response);
});

// Start server
sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log("Server started on port 3000");
  });
});
