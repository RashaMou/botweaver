export class ValidationError extends Error {
  statusCode: number;
  message: string;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = statusCode;
    this.message = message;
  }
}
