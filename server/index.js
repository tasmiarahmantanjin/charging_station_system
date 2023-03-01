import express from "express";
import cors from "cors";
import chalk from "chalk";

// Import the routes
import companyRoutes from "./routes/company.js";
// import forgotPasswordRoute from "./routes/forgotPassword.js";
// import movieRoutes from "./routes/movie.js";
// import profileRoute from "./routes/profile.js";

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

app.listen(port, () => {
  console.info(
    `${`${chalk.yellow(`CORS-enabled web Server started on port: ${port}`)}`}`
  );
});
