import { Router, Request, Response } from "express";
import { asyncHandler } from "@/routes/middleware/errorHandler";
import logger from "@/logger";
import { Update } from "node-telegram-bot-api";
import telegramService from "@/services/telegram/telegram.service";

const router = Router();

router.post(
  "/telegram/:botId",
  asyncHandler(async (req: Request, res: Response) => {
    res.sendStatus(200);

    try {
      const update = req.body as Update;

      logger.info("Received Telegram update:", {
        updateId: update.update_id,
        chatId: update.message?.chat.id,
        messageText: update.message?.text,
      });

      if (!update.message?.chat.id) {
        logger.error("Invalid update received:", update);
        return;
      }

      telegramService.processUpdate(update);
    } catch (error) {
      logger.error("Error processing webhook:", error);
    }
  }),
);

export default router;
