import express, { Request, Response } from "express";
import botRoutes from "./bots";
import conversationRoutes from "./conversations";
import agentRoutes from "./agents";

const router = express.Router();

router.get("/", (_: Request, res: Response): void => {
  res.send("Hello from the server");
});

router.use("/bots", botRoutes);
router.use("/conversations", conversationRoutes);
router.use("/agent", agentRoutes);

export default router;
