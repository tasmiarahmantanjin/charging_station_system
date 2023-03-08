import express from "express";
import rateLimit from "express-rate-limit";

import validate from "../validators/index.js";
import {
  nameValidationRules,
  idValidationRules,
} from "../validators/company/company.js";

import companyController from "../controllers/company.js";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

const router = express.Router();

// Getting companies
router.get("/", apiLimiter, [validate], companyController.getCompanies);

// Creating a company
router.post(
  "/",
  apiLimiter,
  [validate, nameValidationRules],
  companyController.createCompany
);

// Getting a company by ID
router.get(
  "/:id",
  apiLimiter,
  [validate, idValidationRules],
  companyController.getCompany
);

// Updating a company by ID
router.put(
  "/:id",
  apiLimiter,
  [validate, idValidationRules],
  companyController.updateCompany
);

// Deleting a company by ID
router.delete(
  "/:id",
  apiLimiter,
  [validate, idValidationRules],
  companyController.deleteCompany
);

export default router;
