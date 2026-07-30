import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHealthRouter } from "./health/health.route.js";
import {
  checkHealth,
  type HealthChecker
} from "./health/health.service.js";
import {
  apiNotFound,
  errorHandler
} from "./middleware/error-handler.js";
import { providerRouter } from "./providers/provider.routes.js";

export type CreateAppOptions = {
  healthChecker?: HealthChecker;
  serveFrontend?: boolean;
};

export const createApp = ({
  healthChecker = checkHealth,
  serveFrontend = process.env.NODE_ENV === "production"
}: CreateAppOptions = {}) => {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());
  app.use("/api/health", createHealthRouter(healthChecker));
  app.use("/api/providers", providerRouter);
  app.use("/api", apiNotFound);

  if (serveFrontend) {
    const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
    const clientDirectory = path.resolve(currentDirectory, "../client");

    app.use(express.static(clientDirectory));
    app.get("/{*path}", (_request, response) => {
      response.sendFile(path.join(clientDirectory, "index.html"));
    });
  }

  app.use(errorHandler);

  return app;
};