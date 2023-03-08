import express from "express";
import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

import childCompanyController from "../controllers/childCompanies.js";
import validate from "../validators/index.js";

import { idValidationRules } from "../validators/company/company.js";

const router = express.Router();

// Route for parsing the script
router.get(
  "/:id",
  apiLimiter,
  [validate, idValidationRules],
  childCompanyController.getCompanyAndAssociations
);

export default router;
