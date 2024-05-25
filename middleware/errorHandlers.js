// import { createLogger, format, transports } from "winston";

// const logger = createLogger({
//   level: "info",
//   format: format.combine(
//     format.colorize(),
//     format.timestamp(),
//     format.printf(
//       ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`
//     )
//   ),
//   transports: [
//     new transports.Console(),
//     new transports.File({ filename: "error.log", level: "error" }),
//   ],
// });

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

class InternalServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}

export const notFoundHandler = (req, res, next) => next(new NotFoundError());

export const errorHandler = (err, req, res, next) => {
  if (!(err instanceof AppError)) err = new InternalServerError();

  console.log("\n", err.stack, "\n");

  const response = { message: err.message };

  if (process.env.NODE_ENV === "development") response.stack = err.stack;

  res.status(err.statusCode || 500).json(response);
};
