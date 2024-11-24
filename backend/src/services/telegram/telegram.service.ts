import { TELEGRAM_CONFIG } from "@/config/telegram.config";
import { Message, Update } from "node-telegram-bot-api";
import { TelegramError } from "@/errors/types/telegram.errors";
import TELEGRAM_ERRORS from "@/errors/constants/telegram.constants";
import logger from "@/logger";
import { env } from "@/config/env.config";

// General:
// setup and manage webhook endpoints for receiving messages
// send messages to users/groups
// handle incoming webhook updates
// manage bot configurations
// handle api errors and rate limits
//
// Specific:
// Webhook management:
//  - setup webhook url
//  - validate webhook responses
//  - delete webhook when needed
//  - get webhook status/info
// Message handling:
//  - send text messages
//  - send media (photos, documents)
//  - handle message formatting
//  - support reply keyboards/inline keyboards
//  - support message templates
// Error handling:
//  - handle api errors
//  - implement retry logic for recoverable errors
//  - log errors appropriately
//  - validate inputs before api calls
// Rate limiting:
//  - Respect telegram's rate limits
//  - implement local rate limiting
//  - queue messages if needed
//  - handle rate limit errors
// configuration:
//  - Manage bot tokens
//  - handle environment-specific settings
//  - store bot-specific configurations

class TelegramService {
  private static instance: TelegramService;

  private webhookUrl: string = "";
  private token: string;
  private telegramBaseUrl: string = "https://api.telegram.org/";
  private telegramUrl: string;
  private botId: string;

  private constructor() {
    if (!env.TELEGRAM_BOT_TOKEN) {
      throw new TelegramError(TELEGRAM_ERRORS.TOKEN_MISSING);
    }
    this.token = env.TELEGRAM_BOT_TOKEN;
    this.telegramUrl = this.telegramBaseUrl + this.token;
    this.botId = this.token.split(":")[0];
  }

  // provide access to the singleton method
  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  private handleTelegramError(response: Response, error?: any): never {
    // Handle rate limiting
    if (response.status === 429) {
      throw new TelegramError(TELEGRAM_ERRORS.RATE_LIMIT_EXCEEDED);
    }

    // Handle specific Telegram error codes from response data
    const errorData = error?.description || "";

    if (errorData.includes("bot was blocked")) {
      throw new TelegramError(TELEGRAM_ERRORS.BOT_BLOCKED);
    }

    if (errorData.includes("chat not found")) {
      throw new TelegramError(TELEGRAM_ERRORS.CHAT_ID_MISSING);
    }

    if (errorData.includes("invalid bot token")) {
      throw new TelegramError(TELEGRAM_ERRORS.INVALID_TOKEN);
    }

    // Handle HTTP status codes
    switch (response.status) {
      case 400:
        throw new TelegramError(TELEGRAM_ERRORS.MESSAGE_TEXT_MISSING);
      case 401:
        throw new TelegramError(TELEGRAM_ERRORS.INVALID_TOKEN);
      case 403:
        throw new TelegramError(TELEGRAM_ERRORS.BOT_BLOCKED);
      default:
        throw new TelegramError(TELEGRAM_ERRORS.API_ERROR);
    }
  }

  async setWebhook(): Promise<void> {
    // set webhook url
    if (env.NODE_ENV === "production") {
      if (!env.TELEGRAM_WEBHOOK_URL) {
        throw new TelegramError(TELEGRAM_ERRORS.WEBHOOK_URL_NOT_SET);
      }
      this.webhookUrl = `${env.TELEGRAM_WEBHOOK_URL}/webhook/telegram/${this.botId}`;
    } else {
      if (!env.TELEGRAM_WEBHOOK_DEV_URL) {
        throw new TelegramError(TELEGRAM_ERRORS.WEBHOOK_URL_NOT_SET);
      }
      this.webhookUrl = `${env.TELEGRAM_WEBHOOK_DEV_URL}/webhook/telegram/${this.botId}`;
    }

    try {
      const response = await fetch(
        `${this.telegramUrl}/setWebhook?url=${this.webhookUrl}`,
        {
          signal: AbortSignal.timeout(TELEGRAM_CONFIG.TIMEOUT_MS),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        this.handleTelegramError(response, data);
      }

      logger.info(data.description);
      return;
    } catch (error) {
      if (error instanceof TelegramError) {
        throw error;
      }
      throw new TelegramError(TELEGRAM_ERRORS.WEBHOOK_ERROR);
    }
  }

  async sendMessage(chatId: string, message: string): Promise<Message> {
    this.validateMessage(chatId, message);

    try {
      const response = await fetch(`${this.telegramUrl}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
        signal: AbortSignal.timeout(TELEGRAM_CONFIG.TIMEOUT_MS),
      });

      const data = await response.json();

      if (!response.ok) {
        this.handleTelegramError(response, data);
      }

      return data.result;
    } catch (error) {
      logger.error("Telegram API error:", error);
      if (error instanceof TelegramError) {
        throw error;
      }
      throw new TelegramError(TELEGRAM_ERRORS.API_ERROR);
    }
  }

  async getWebhookInfo(): Promise<void> {
    try {
      const response = await fetch(`${this.telegramUrl}/getWebhookInfo`, {
        signal: AbortSignal.timeout(TELEGRAM_CONFIG.TIMEOUT_MS),
      });
      const data = await response.json();

      if (!data.ok) {
        this.handleTelegramError(response, data);
      }

      return data.result;
    } catch (error) {
      logger.error("Telegram API error:", error);
      if (error instanceof TelegramError) {
        throw error;
      }
      throw new TelegramError(TELEGRAM_ERRORS.API_ERROR);
    }
  }

  private validateMessage(chatId: string, message: string) {
    if (!chatId) throw new TelegramError(TELEGRAM_ERRORS.CHAT_ID_MISSING);
    if (!message) throw new TelegramError(TELEGRAM_ERRORS.MESSAGE_TEXT_MISSING);
  }

  public async processUpdate(update: Update) {
    try {
      // call FlowEngineService with TelegramUpdate
      logger.info("Processing message:", {
        chatId: update.message?.chat.id,
        text: update.message?.text,
      });
    } catch (error) {
      logger.error("Error in processUpdate:", error);
    }
  }
}

export default TelegramService.getInstance();
