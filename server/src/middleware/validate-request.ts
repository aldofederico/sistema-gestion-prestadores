import type { RequestHandler } from "express";
import { z, type ZodType } from "zod";
import { AppError } from "../errors/app-error.js";

type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export type ValidatedRequest = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

export const validateRequest = (schemas: RequestSchemas): RequestHandler => {
  return (request, response, next) => {
    try {
      const validated: ValidatedRequest = {};

      if (schemas.body) validated.body = schemas.body.parse(request.body);
      if (schemas.params) validated.params = schemas.params.parse(request.params);
      if (schemas.query) validated.query = schemas.query.parse(request.query);

      response.locals.validated = validated;
      next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        next(
          new AppError(400, "VALIDATION_ERROR", "Solicitud inválida.", {
            fields: error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message
            }))
          })
        );
        return;
      }

      next(error);
    }
  };
};