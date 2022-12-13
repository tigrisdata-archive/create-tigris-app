import { BaseError } from "../../utils/errors";
import express from "express";

const handleErrors: express.ErrorRequestHandler = (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!(err instanceof BaseError)) {
    next(err);
  }

  return res.status(err.httpCode).json({
    error: err.description,
    isOperational: err.isOperational,
    additional: err.additional,
  });
};

export default handleErrors;
