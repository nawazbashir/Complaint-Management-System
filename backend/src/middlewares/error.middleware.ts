import type { NextFunction, Response, Request } from "express";
import type { ApiError } from "../utils/ApiError.js";
import type { ControllerType } from "../types/types.js";

export const errorMiddleware = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export const TryCatch =
  (func: ControllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };
