export class ValidationError extends Error {
  public error: string;
  public details: string;
  public statusCode: number;

  constructor({
    error,
    details,
    statusCode,
  }: {
    error: string;
    details: string;
    statusCode: number;
  }) {
    super(details);
    this.name = "ValidationError";
    this.error = error;
    this.details = details;
    this.statusCode = statusCode;
  }
}
