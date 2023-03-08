import express from "express";
import rateLimit from "express-rate-limit";

import validate from "../validators/index.js";
import {
  nameValidationRules,
  idValidationRules,
} from "../validators/company/company.js";

import stationController from "../controllers/station.js";

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
  [validate, nameValidationRules],
  stationController.createStation
);

// Getting a company by ID
router.get(
  "/:id",
  apiLimiter,
  [validate, idValidationRules],
  stationController.getStation
);

// Updating a company by ID
router.put(
  "/:id",
  apiLimiter,
  [validate, idValidationRules],
  stationController.updateStation
);

// Deleting a company by ID
router.delete(
  "/:id",
  apiLimiter,
  [validate, idValidationRules],
  stationController.deleteStation
);

export default router;
