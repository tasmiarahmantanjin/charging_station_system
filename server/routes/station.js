import express from "express";
import rateLimit from "express-rate-limit";

import validate from "../validators/index.js";
import {
  companyNameRules,
  companyParamRules,
} from "../validators/company/company.js";

import stationController from "../controllers/station.js";

/*
Stations API
GET /stations: Get a list of all stations
GET /stations/:id: Get a single station by id
POST /stations: Create a new station
PUT /stations/:id: Update an existing station by id
DELETE /stations/:id: Delete a station by id
*/

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

const router = express.Router();

// Getting companies
router.get("/", apiLimiter, [validate], stationController.getStations);

// Creating a company
router.post(
  "/",
  apiLimiter,
  [validate, companyNameRules],
  stationController.createStation
);

// Getting a company by ID
router.get(
  "/:id",
  apiLimiter,
  [validate, companyParamRules],
  stationController.getStation
);

// Updating a company by ID
router.put(
  "/:id",
  apiLimiter,
  [validate, companyParamRules],
  stationController.updateStation
);

// Deleting a company by ID
router.delete(
  "/:id",
  apiLimiter,
  [validate, companyParamRules],
  stationController.deleteStation
);

export default router;
