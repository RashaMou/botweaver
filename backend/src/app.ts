import express, { Express } from "express";
import routes from "./routes";
import cookieParser from "cookie-parser";
import { errorHandler } from "./routes/middleware/errorHandler";

const app: Express = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use(routes);

// Error handling
app.use(errorHandler);

export default app;
