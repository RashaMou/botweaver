import { Router, Request, Response } from "express";
import { asyncHandler } from "@/routes/middleware/errorHandler";

const router = Router();

router.post(
  "/webhook/telegram/:botId",
  asyncHandler(async (req: Request, res: Response) => {}),
);

export default router;
