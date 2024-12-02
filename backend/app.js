import sentryInit from "./config/sentry.js";
import * as Sentry from "@sentry/node";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middleware/errors.js";
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err}`);
  console.log("Shutting down due to uncaught exception");
  process.exit(1);
});

// Set up environment variables for development
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({ path: "backend/config/config.env" });
}

// Initialize Sentry
sentryInit();

// Import Express after initializing Sentry as per docs
import express from "express";
const app = express();

// Connect to database
connectDatabase();

// Middleware for CORS
app.use(cors({
  credentials: true,
  origin: process.env.FRONTEND_URL,
}));

// Middleware for JSON
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// Middleware for cookies
app.use(cookieParser());

// Routes
app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", paymentRoutes);

// Serve frontend if in production
if (process.env.NODE_ENV === "PRODUCTION") {
  app.use(express.static(path.join(process.cwd(), "./frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(process.cwd(), "./frontend/dist/index.html"));
  });
}

// Sentry error handler
Sentry.setupExpressErrorHandler(app);

// Error middleware
app.use(errorMiddleware);

// Start server after database has been connected
let server;

mongoose.connection.once('open', () => {
  server = app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
  });
});

//Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err}`);
  console.log("Shutting down server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});