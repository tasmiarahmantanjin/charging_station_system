import express from "express";
import rateLimit from "express-rate-limit";

import validate from "../validators/index.js";

import scriptsController from "../controllers/script.js";

const router = express.Router();

// Route for parsing the script
router.post("/", [validate], scriptsController.script);

export default router;
