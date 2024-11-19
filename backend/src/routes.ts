import express, { Request, Response, NextFunction } from "express";
import logger from "../../logger";

const router = express.Router();

router.get("/", (_: Request, res: Response): void => {
  res.send("Hello from the server");
});

// error handling middleware
const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Global error handler
router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

//// Bot management routes ////

// Create new bot
router.post(
  "/bots",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Get bot details
router.get(
  "/bots/:id",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Update bot
router.put(
  "/bots/:id",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Delete bot
router.delete(
  "/bots/:id",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Get flow configuration
router.get(
  "/bots/:id/flow",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// Update flow
router.put(
  "/bots/:id/flow",
  asyncHandler(async (req: Request, res: Response) => {}),
);

// validate flow
router.post(
  "/bots/:id/validate",
  asyncHandler(async (req: Request, res: Response) => {}),
);

//// Conversation management routes ////

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

//// Agent interface routes ////

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

//// Webhook handlers ////

// Telegram webhook endpoint
router.post(
  "/webhook/telegram/:botId",
  asyncHandler(async (req: Request, res: Response) => {}),
);

export default router;
