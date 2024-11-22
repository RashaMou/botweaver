import express, { Express } from "express";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import routes from "./routes";
import cookieParser from "cookie-parser";
import { errorHandler } from "./routes/middleware/errorHandler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const app: Express = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use(routes);

// Error handling
app.use(errorHandler);

export default app;
