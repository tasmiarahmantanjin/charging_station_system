import express from "express";
import companyController from "../controllers/company.js";

const router = express.Router();

// TODO: We have validation inside the controller function
// API for getting all companies
router.get("/", companyController.login);

// API for creating a company
router.post("/", companyController.login);

// API for getting a company by ID
router.get("/:id", companyController.login);

// API for updating a company by ID
router.put("/:id", companyController.login);

// API for deleting a company by ID
router.delete("/", companyController.login);

export default router;
