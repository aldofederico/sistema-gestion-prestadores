import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response
} from "express";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const apiNotFound = (
  _request: Request,
  _response: Response,
  next: NextFunction
) => {
  next(new AppError(404, "API_ROUTE_NOT_FOUND", "Ruta de API no encontrada."));
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

  response.status(appError.status).json({
    error: {
      code: appError.code,
      message: appError.message,
      details: appError.details
    }
  });
};
