import { Router, Request, Response } from "express";
import { asyncHandler } from "@/routes/middleware/errorHandler";

const router = Router();

// List bot conversations
router.get(
  "/conversations/:id",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Initiate agent handoff
router.post(
  "/conversations/:id/handoff",
  asyncHandler(async (req: Request, res: Response) => {}),
);

export default router;
