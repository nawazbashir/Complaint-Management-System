import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import dotenv from "dotenv";
import { TryCatch } from "./error.middleware.js";
import type { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

dotenv.config();
export const authMiddleware = TryCatch(async(req, res, next) => {
  const header = req.headers.authorization;

  if (!header) return next(new ApiError(401, "No token"));

  const token = header.split(" ")[1];
    console.log(token)
  if (!token) return next(new ApiError(401, "No token"));

  jwt.verify(token, process.env.JWT_ACCESS_SECRET as string, (err, decoded) => {
    if (err) return next(new ApiError(401, "Invalid token"));

    req.user = decoded;
    next();
  });
});
