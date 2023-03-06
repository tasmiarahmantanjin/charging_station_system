-- Create the database
-- CREATE DATABASE charging_station_system;

-- Create Company table
-- CREATE TABLE IF NOT EXISTS Company (
CREATE TABLE Company (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  parent_id INTEGER REFERENCES Company(id)
);

-- Create StationType table
-- CREATE TABLE IF NOT EXISTS StationType (
CREATE TABLE StationType (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  maxPower INTEGER NOT NULL
);

-- Create Station table
-- CREATE TABLE IF NOT EXISTS Station (
CREATE TABLE Station (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  company_id INTEGER NOT NULL REFERENCES Company(id),
  type_id INTEGER NOT NULL REFERENCES StationType(id)
);

-- ALTER TABLE chargingactivity ADD CONSTRAINT chargingactivity_station_id_key UNIQUE (station_id);
-- Create ChargingState table
CREATE TABLE ChargingState (
  id SERIAL PRIMARY KEY,
  station_id INTEGER NOT NULL REFERENCES Station(id),
  -- Indicates whether the station is currently charging or not
  charging BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create ChargingActivity table
CREATE TABLE ChargingActivity (
  id SERIAL PRIMARY KEY,
  station_id INTEGER NOT NULL REFERENCES Station(id),
  company_id INTEGER NOT NULL REFERENCES Company(id),
  --- Also add the parent_id of the company which we can get the company tables parent_id
  company_parent_id INTEGER REFERENCES Company(id),
  startTimestamp TIMESTAMP NOT NULL,
  endTimestamp TIMESTAMP,
  isCharging BOOLEAN NOT NULL DEFAULT FALSE,
  chargingPower INTEGER NOT NULL
);

-- Insert sample data into Company table
INSERT INTO Company (name, parent_id)
VALUES ('company 1', NULL),
       ('company 2', 1),
       ('company 3', 1);

-- Insert sample data into StationType table
INSERT INTO StationType (name, maxPower)
VALUES ('Type 1', 10);

-- Insert sample data into Station table
INSERT INTO Station (name, company_id, type_id)
VALUES ('station 1', 3, 1),
       ('station 2', 2, 1),
       ('station 3', 2, 1),
       ('station 4', 3, 1),
       ('station 5', 1, 1);

