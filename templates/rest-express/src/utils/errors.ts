export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER = 500,
}
export class BaseError extends Error {
  public readonly description: string;
  public readonly httpCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly additional: any;

  constructor(
    httpCode: HttpStatusCode,
    description: string,
    isOperational: boolean,
    additional: any
  ) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.description = description;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    this.additional = additional;

    Error.captureStackTrace(this);
  }
}

export class APIError extends BaseError {
  constructor(
    httpCode = HttpStatusCode.INTERNAL_SERVER,
    description = "internal server error",
    additional = {}
  ) {
    super(httpCode, description, true, additional);
  }
}
