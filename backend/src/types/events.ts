export interface Event {
  id: string;
  type: "message" | "button_click";
  platformId: "telegram" | "whatsapp";
  channelId: string; // chat.id
  userId: string; // from.id
  text?: string; // message.text or callback_query.data
  timestamp: Date; // message.date
  metadata?: {
    replyTo?: string; // id of the message being replied to
    isForwarded?: boolean;
  };
}
