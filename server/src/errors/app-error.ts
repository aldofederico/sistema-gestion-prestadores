export type ErrorCode =
  | "VALIDATION_ERROR"
  | "PROVIDER_NOT_FOUND"
  | "PROVIDER_CUIT_CONFLICT"
  | "DATABASE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}