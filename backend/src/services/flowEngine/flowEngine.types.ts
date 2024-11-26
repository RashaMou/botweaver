export interface ConversationIdentifier {
  platform: "telegram" | "whatsapp";
  chatId: string;
  userId?: string;
}

export interface Conversation {
  id: string;
  flowId: string;
  currentNode: string;
  platform: {
    type: "telegram" | "whatsapp";
    chatId: string;
    userId?: string;
  };
  variables: Record<string, any>;
  status: "active" | "waiting" | "with_agent" | "completed";
  lastUpdate: Date;
}

export interface ConversationInitData {
  platform: "telegram" | "whatsapp";
  chatId: string;
  userId?: string;
  flowId: string;
  initialVariables?: Record<string, any>;
}

interface BaseNode {
  id: string;
  type: "message" | "input" | "conditional" | "action" | "handoff";
  next?: string | { [key: string]: string }; // can be string for simple next, or object for conditional branching
}

export interface MessageNode extends BaseNode {
  type: "message";
  content: string;
  next: string;
}

export interface InputNode extends BaseNode {
  type: "input";
  variable: string; // where to store the user's input
  prompt: string; // what to ask the user
  validation?: {
    type: "text" | "number" | "email" | "phone" | "regex";
    pattern?: string; // for regex validation
    errorMessage?: string;
  };
}

export interface ConditionalNode extends BaseNode {
  type: "conditional";
  conditions: {
    variable: string;
    operator: "equals" | "contains" | "greater" | "less" | "matches";
    value: string | number;
  }[];
  next: { [key: string]: string }; // different paths based on condition
}

export interface ActionNode extends BaseNode {
  type: "action";
  action: {
    type: "api" | "webhook" | "function";
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    payload?: Record<string, any>;
    headers?: Record<string, string>;
  };
  next: string;
}

export interface HandoffNode extends BaseNode {
  type: "handoff";
  config: {
    queue?: string;
    timeout?: number;
    fallbackNode?: string;
    message?: string; // message to show user during handoff
  };
}

export type Node =
  | MessageNode
  | InputNode
  | ConditionalNode
  | ActionNode
  | HandoffNode;
