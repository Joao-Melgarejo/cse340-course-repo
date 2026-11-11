import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import db, { testConnection } from "./src/models/db.js";
import router from "./src/routes.js";

// Read configuration supplied by the local .env file or hosting service.
const nodeEnv = process.env.NODE_ENV?.toLowerCase() || "production";
const port = process.env.PORT || 3000;
const currentFilename = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilename);
const app = express();

// Resolve paths from this file so they also work from another working directory.
app.set("view engine", "ejs");
app.set("views", path.join(currentDirectory, "src/views"));

// Run before static files and routes so every development request is logged.
app.use((req, res, next) => {
  if (nodeEnv === "development") console.log(`${req.method} ${req.url}`);
  next();
});

// Shared template data is available to normal pages and error pages alike.
app.use((req, res, next) => {
  res.locals.NODE_ENV = nodeEnv;
  res.locals.currentPath = req.path;
  next();
});

app.use(express.static(path.join(currentDirectory, "public")));
app.use(router);

// Unmatched routes must explicitly enter the error-handling pipeline.
app.use((req, res, next) => {
  const error = new Error("Page Not Found");
  error.status = 404;
  next(error);
});

// Express 5 forwards rejected async route handlers to this middleware.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const requestedStatus = error.status || error.statusCode;
  const status =
    Number.isInteger(requestedStatus) &&
    requestedStatus >= 400 &&
    requestedStatus <= 599
      ? requestedStatus
      : 500;
  const template = status === 404 ? "404" : status === 400 ? "400" : "500";
  const titles = {
    400: "Bad Request",
    404: "Page Not Found",
    500: "Server Error",
  };

  // Detailed diagnostics are limited to development; never log configuration.
  console.error("Request failed:", status, error.code || "HTTP_ERROR");
  if (nodeEnv === "development") console.error(error.stack);
  res.status(status).render(`errors/${template}`, {
    title: titles[template],
    error: nodeEnv === "development" ? error.message : "",
    stack: nodeEnv === "development" ? error.stack : "",
  });
});

// Verify the database before accepting requests; a failed connection exits clearly.
try {
  await testConnection();
  app.listen(port, () => {
    console.log(`Server is running at http://127.0.0.1:${port}`);
    console.log(`Environment: ${nodeEnv}`);
  });
} catch {
  console.error(
    "Startup failed. Check DB_URL, SSL settings and database availability.",
  );
  await db.close();
  process.exitCode = 1;
}
