import express, { Express } from "express";
import logger from "../logger";

const app: Express = express();
const port: number = parseInt(process.env.PORT || "8080", 10);

app.listen(port, () => {
  logger.info(`Server running on "http://localhost:${port}"`);
});
