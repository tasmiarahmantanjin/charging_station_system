import express from "express";
import companyController from "../controllers/company.js";

const router = express.Router();

// TODO: We have validation inside the controller function
// API for getting all companies
router.get("/", companyController.getCompanies);

// API for creating a company
router.post("/", companyController.createCompany);

// API for getting a company by ID
router.get("/:id", companyController.getCompany);

// API for updating a company by ID
router.put("/:id", companyController.updateCompany);

// API for deleting a company by ID
router.delete("/", companyController.deleteCompany);

export default router;
