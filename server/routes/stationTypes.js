import express from "express";
import rateLimit from "express-rate-limit";

import validate from "../validators/index.js";
import {
  companyNameRules,
  companyParamRules,
} from "../validators/company/company.js";

import stationTypesController from "../controllers/stationTypes.js";

/**
 * Station Types API
 * GET /stationTypes: Get a list of all station types
 * GET /stationType/:id: Get a single station type by id
 * POST /stationType: Create a new station type
 * PUT /stationType/:id: Update an existing station type by id
 * DELETE /stationType/:id: Delete a station type by id
 */

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
  [validate, companyNameRules],
  stationTypesController.createStationType
);

// Getting a company by ID
router.get(
  "/:id",
  apiLimiter,
  [validate, companyParamRules],
  stationTypesController.getStationType
);

// Updating a company by ID
router.put(
  "/:id",
  apiLimiter,
  [validate, companyParamRules],
  stationTypesController.updateStationType
);

// Deleting a company by ID
router.delete(
  "/:id",
  apiLimiter,
  [validate, companyParamRules],
  stationTypesController.deleteStationType
);

export default router;
