import express, { Express } from "express";
import logger from "@/logger";
import routes from "@/routes";
import cookieParser from "cookie-parser";
import { errorHandler } from "@/routes/middleware/errorHandler";

const app: Express = express();
const port: number = parseInt(process.env.PORT || "8080", 10);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use(routes);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server running on "http://localhost:${port}"`);
});
