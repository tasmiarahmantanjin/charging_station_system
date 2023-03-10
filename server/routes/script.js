import express from "express";
import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

import validate from "../validators/index.js";

import scriptsController from "../controllers/script.js";

const router = express.Router();

// Route for parsing the script
router.post("/", apiLimiter, [validate], scriptsController.script);

export default router;
