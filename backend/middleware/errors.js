import { ErrorHandler } from "../utils/errors.js";

export default (err, req, res, next) => {
  let error;

  // Handle Mongoose cast errors
  if (err.name === "CastError" && !err.statusCode) {
    const message = "Invalid Request";
    error = new ErrorHandler(message, 400);
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError" && !err.statusCode) {
    // Only display a message for the first validation error
    const message = Object.values(err.errors)[0].message;
    error = new ErrorHandler(message, 400);
  }

  // Define error if it does not match the above
  if (!error) {
    error = {
      statusCode: err.statusCode || 500,
      name: err.name || "Error",
      message: err.message || "Internal Server Error",
      type: err.type,
    };
  }

  // Handle backend errors
  if (error.statusCode.toString()[0] === "5") {
    console.log(err.stack);
    error = { ...error, message: "Internal Server Error" };
  }

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(error.statusCode).json({
      message: error.message,
      type: error.type,
      stack: err.stack,
    });
  }

  if (process.env.NODE_ENV === "PRODUCTION") {
    res.status(error.statusCode).json({
      message: error.message,
      type: error.type,
    });
  }
};
