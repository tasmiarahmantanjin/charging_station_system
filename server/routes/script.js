import express from "express";
import rateLimit from "express-rate-limit";

import validate from "../validators/index.js";

import scriptsController from "../controllers/script.js";

const router = express.Router();

// Getting companies
router.get("/", [validate], scriptsController.scripts);

export default router;
