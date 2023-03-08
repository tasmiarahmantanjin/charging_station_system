import express from "express";
import cors from "cors";
import chalk from "chalk";

// Import the routes
import companyRoutes from "./routes/company.js";
import stationRoutes from "./routes/station.js";
import stationTypesRoutes from "./routes/stationTypes.js";
import script from "./routes/script.js";
import childCompaniesRoutes from "./routes/childCompanies.js";

const port = process.env.APP_BACKEND_PORT || 8000;

// Create Express server
const app = express();

// to solve the issue to render data from one port to another
app.use(cors());

// parse application/x-www-form-urlencoded: Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use imported routes
app.use("/companies", companyRoutes);
app.use("/stations", stationRoutes);
app.use("/stationTypes", stationTypesRoutes);
app.use("/child-companies", childCompaniesRoutes);
app.use("/script-parser", script);

app.listen(port, () => {
  console.info(
    `${`${chalk.yellow(`CORS-enabled web Server started on port: ${port}`)}`}`
  );
});
