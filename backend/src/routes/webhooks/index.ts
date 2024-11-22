import { Router, Request, Response } from "express";
import { asyncHandler } from "@/routes/middleware/errorHandler";
import logger from "@/logger";

const router = Router();

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
}

router.post(
  "/telegram/:botId",
  asyncHandler(async (req: Request, res: Response) => {
    res.sendStatus(200);

    try {
      const update = req.body as TelegramUpdate;

      logger.info("Received Telegram update:", {
        updateId: update.update_id,
        chatId: update.message?.chat.id,
        messageText: update.message?.text,
      });

      if (!update.message?.chat.id) {
        logger.error("Invalid update received:", update);
        return;
      }

      processUpdate(update);
    } catch (error) {
      logger.error("Error processing webhook:", error);
    }
  }),
);

async function processUpdate(update: TelegramUpdate) {
  try {
    // Here we'll add the message processing logic
    // For now, just log it
    logger.info("Processing message:", {
      chatId: update.message?.chat.id,
      text: update.message?.text,
    });
  } catch (error) {
    logger.error("Error in processUpdate:", error);
  }
}

export default router;
