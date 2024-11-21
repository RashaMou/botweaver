import { Router } from "express";
import apiRoutes from "./api";
import authRoutes from "./auth";
import { authenticate } from "./middleware/authenticate";

const router = Router();

router.use("/api", authenticate, apiRoutes);
router.use("/auth", authRoutes);

export default router;
