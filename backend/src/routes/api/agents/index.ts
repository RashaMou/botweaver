import { Router, Request, Response } from "express";
import { asyncHandler } from "@/routes/middleware/errorHandler";

const router = Router();

// List available conversations
router.get(
  "/agent/conversations",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Claim conversation
router.put(
  "/agent/conversations/:id/claim",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Send message
router.post(
  "/agent/conversations/:id/message",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Release conversation
router.put(
  "/agent/conversations/:id/release",
  asyncHandler(async (req: Request, res: Response) => {}),
);

export default router;
