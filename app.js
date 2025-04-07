import express from "express";
import { createServer } from "http";
import Routes from "./src/api/v1/routes/index.routes.js";
import dotenv from "dotenv";
import morgan from "morgan";
import errorHandler from "./src/api/v1/middlewares/errorHandler.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const server = createServer(app);

// Setting-up cors origin
const allowedOrigins = ['http://localhost:5173']

// Enabling request body parsing
app.use(express.json()); // Content-Type:application/json
app.use(express.urlencoded({ extended: true })); // Content-Type:application/x-www-form-urlencoded

// Http-Only Cookie setup
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Enabling logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

Routes(app);

// Error handling middleware
app.use(errorHandler);

const url = process.env.BASE_URL || 'http://localhost:3000';
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running at ${url}`);
})