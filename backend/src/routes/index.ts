import { Router } from "express";
import apiRoutes from "./api";
import authRoutes from "./auth";
import webhookRoutes from "./webhooks";
import { authenticate } from "./middleware/authenticate";

const router = Router();
router.use((req, res, next) => {
  console.log("Request URL:", req.originalUrl);
  next();
});
router.use("/webhooks", webhookRoutes);
router.use("/api", authenticate, apiRoutes);
router.use("/auth", authRoutes);

export default router;
