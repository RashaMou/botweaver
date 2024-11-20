export class AuthenticationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code?: string,
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}
