export interface LlmGateway {
  getReasoningLLM(): Promise<any>;
  getSpeedyLLM(): Promise<any>;
  getReasoningStructuredLLM(schema: any, name: string): Promise<any>;
  getReasoningToolBoundLLM(tools: any[]): Promise<any>;
}

export interface PromptPort {
  constructPrompt(context: string, history: string, question: string): Promise<string> | string;
  buildChatMessages(history: string, question: string): any[];
  buildIntentClassificationPrompt(question: string): any[];
  buildConversationalMessages(history: string, question: string): any[];
}

export interface RetrievalPort {
  generateQueryVariations(query: string, llm: any): Promise<string[]>;
  performHybridSearch(
    queries: string[],
    originalQuery: string,
    filters?: Record<string, any>,
  ): Promise<any[]>;
}

export interface GenerationPort {
  generateAnswer(
    llm: any,
    prompt: string,
    context: string,
    filteredResults: any[],
  ): Promise<{ answer: string; context: string; validated: any }>;
}

export interface ToolRegistry {
  getTools(): { list: any[]; byName: Record<string, { invoke: (args: any) => Promise<any> }> };
}

export interface MessageHistoryPort {
  getRecentHistory(chatId: string, limit: number): Promise<string>;
}

export class ChatEngineConfig {
  readonly maxIterations = 5;
  readonly appScopeReply =
    'I can assist with Dev-Collab only, including workspaces, work items, snippets, documentation, and workspace code. Please ask a question related to your application data or workflow.';
}
