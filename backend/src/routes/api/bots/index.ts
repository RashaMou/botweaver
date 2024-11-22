import { asyncHandler } from "@/routes/middleware/errorHandler";
import { Router, Request, Response } from "express";

const router = Router();

// Create new bot
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Get bot details
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Update bot
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Delete bot
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Get flow configuration
router.get(
  "/:id/flow",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Update flow
router.put(
  "/:id/flow",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// validate flow
router.post(
  "/:id/validate",
  asyncHandler(async (req: Request, res: Response) => {}),
);

export default router;
