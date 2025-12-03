// lib/ApiError.ts
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;

    // Fix for extending built-in Error in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
