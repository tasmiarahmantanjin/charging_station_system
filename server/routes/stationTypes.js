import express from "express";
import rateLimit from "express-rate-limit";

import validate from "../validators/index.js";
import {
  nameValidationRules,
  idValidationRules,
} from "../validators/company/company.js";

import stationTypesController from "../controllers/stationTypes.js";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

const router = express.Router();

// Getting companies
router.get("/", apiLimiter, [validate], stationTypesController.getStationTypes);

// Creating a company
router.post(
  "/",
  apiLimiter,
  [validate, nameValidationRules],
  stationTypesController.createStationType
);

// Getting a company by ID
router.get(
  "/:id",
  apiLimiter,
  [validate, idValidationRules],
  stationTypesController.getStationType
);

// Updating a company by ID
router.put(
  "/:id",
  apiLimiter,
  [validate, idValidationRules],
  stationTypesController.updateStationType
);

// Deleting a company by ID
router.delete(
  "/:id",
  apiLimiter,
  [validate, idValidationRules],
  stationTypesController.deleteStationType
);

export default router;
