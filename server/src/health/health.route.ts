import { Router } from "express";
import type { HealthChecker } from "./health.service.js";
import { AppError } from "../errors/app-error.js";

export const createHealthRouter = (healthChecker: HealthChecker) => {
  const router = Router();

  router.get("/", async (_request, response, next) => {
    try {
      response.json(await healthChecker());
    } catch {
      next(
        new AppError(
          503,
          "DATABASE_UNAVAILABLE",
          "La base de datos no está disponible."
        )
      );
    }
  });

  return router;
};
