import { Router } from "express";
import apiRoutes from "./api";
import authRoutes from "./auth";
import { errorHandler } from "./middleware/errorHandler";
import { authenticate } from "./middleware/authenticate";

const router = Router();

router.use("/api", authenticate, apiRoutes);
router.use("/auth", authRoutes);
router.use(errorHandler);

export default Router;
