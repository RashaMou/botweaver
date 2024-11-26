interface TelegramErrorType {
  error: string;
  details: string;
  statusCode: number;
}

export class TelegramError extends Error {
  public statusCode: number;

  constructor({ error, details, statusCode }: TelegramErrorType) {
    super(details);
    this.name = error;
    this.statusCode = statusCode;
  }
}
