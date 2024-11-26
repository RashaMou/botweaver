// - Track current node/state for each conversation
// - Execute node logic (conditions, actions)
// - Handle variable storage/retrieval
// - Manage transitions between nodes

import { Event } from "@/types/events";
import { Conversation, ConversationInitData } from "./flowEngine.types";

// Start: New message arrives
// Decision: Does a conversation state exist for this user?
//
// No -> Create new conversation, start at flow's initial node
// Yes -> Retrieve current node/state
//
//
// Decision: What type of node is current?
//
// Message node -> Send response
// Input collector -> Process user input
// Conditional node -> Evaluate condition
// Action node -> Execute action
// Handoff node -> Transfer to agent
//
//
// Update: Store new conversation state
// Decision: Next node exists?
//
// Yes -> Load next node, return to step 3
// No -> End flow
//

class FlowEngineService {
  private static instance: FlowEngineService;

  private constructor() {}

  public static getInstance(): FlowEngineService {
    if (!FlowEngineService.instance) {
      FlowEngineService.instance = new FlowEngineService();
    }
    return FlowEngineService.instance;
  }

  public static async processEvent(event: Event): Promise<void> {
    let currentNode;

    const isActiveConversation = this.findActiveConversation(
      event.platformId,
      event.userId,
    );

    if (!isActiveConversation) {
      const newConversation = await this.initializeConversation({
        platform: event.platformId,
        chatId: event.channelId,
        userId: event.userId,
        flowId: "", // We need to determine how to get this - maybe from a botId->flowId lookup?
      });
      currentNode = newConversation.currentNode;
    }

    if (isActiveConversation) {
      currentNode = isActiveConversation.currentNode;
    }
  }

  private static findActiveConversation(
    platformId: string,
    userId: string,
  ): Conversation | null {
    return null;
  }

  private static async initializeConversation(
    initData: ConversationInitData,
  ): Promise<Conversation> {}

  private static getCurrentNode() {}
}

export default FlowEngineService.getInstance();
