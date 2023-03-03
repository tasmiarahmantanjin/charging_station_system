-- Create the database
-- CREATE DATABASE charging_station_system;

-- Install the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- create Company table
CREATE TABLE Company (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  parent_id INTEGER REFERENCES Company(id)
);

-- insert sample data into Company table
INSERT INTO Company (name, parent_id)
VALUES ('company 1', NULL),
       ('company 2', 1),
       ('company 3', 1);

-- create StationType table
CREATE TABLE StationType (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  maxPower INTEGER NOT NULL
);

-- insert sample data into StationType table
INSERT INTO StationType (name, maxPower)
VALUES ('Type 1', 10);

-- create Station table
CREATE TABLE Station (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  company_id INTEGER NOT NULL REFERENCES Company(id),
  type_id INTEGER NOT NULL REFERENCES StationType(id)
);

-- Insert sample data into Station table
INSERT INTO Station (name, company_id, type_id)
VALUES ('station 1', 3, 1),
       ('station 2', 2, 1),
       ('station 3', 2, 1),
       ('station 4', 3, 1),
       ('station 5', 1, 1);
