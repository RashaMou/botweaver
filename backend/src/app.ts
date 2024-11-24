import express, { Express } from "express";
import routes from "./routes";
import cookieParser from "cookie-parser";
import { errorHandler } from "./routes/middleware/errorHandler";
import { rateLimiter } from "./routes/middleware/rateLimiter";

const app: Express = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use(routes);
// Error handling
app.use(errorHandler);
// Rate limiter
app.use(rateLimiter);

export default app;
