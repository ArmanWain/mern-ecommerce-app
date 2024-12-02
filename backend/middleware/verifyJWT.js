import catchAsyncErrors from "./catchAsyncErrors.js";
import { ErrorHandler } from "../utils/errors.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

export const verifyJWT = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Login first to access this resource", 401));
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    async (err, decoded) => {
      if (err) {
        return next(new ErrorHandler("Invalid Session", 401));
      }

      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return next(new ErrorHandler("Invalid Session", 401));
      }

      next();
    }
  );
});