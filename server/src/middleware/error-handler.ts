import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response
} from "express";
import { AppError } from "../errors/app-error.js";

export const apiNotFound = (
  _request: Request,
  _response: Response,
  next: NextFunction
) => {
  next(new AppError(404, "PROVIDER_NOT_FOUND", "Recurso no encontrado."));
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  next
) => {
  void next;

  const appError =
    error instanceof AppError
      ? error
      : new AppError(
          500,
          "INTERNAL_ERROR",
          "Ocurrió un error interno inesperado."
        );

  const body: {
    error: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
    };
  } = {
    error: {
      code: appError.code,
      message: appError.message
    }
  };

  if (appError.details !== undefined) {
    body.error.details = appError.details;
  }

  response.status(appError.status).json(body);
};