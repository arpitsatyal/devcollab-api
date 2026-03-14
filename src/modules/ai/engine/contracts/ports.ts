import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseMessage } from '@langchain/core/messages';
import { RunnableLike } from '@langchain/core/runnables';
import { StructuredTool } from '@langchain/core/tools';
import { ZodTypeAny } from 'zod';

// -------- LLM contracts (segregated) --------
export interface ReasoningModelProvider {
  getReasoningLLM(): Promise<BaseChatModel>;
}

export interface SpeedyModelProvider {
  getSpeedyLLM(): Promise<BaseChatModel>;
}

export interface StructuredOutputProvider {
  getReasoningStructuredLLM(
    schema: ZodTypeAny | Record<string, any>,
    name: string,
  ): Promise<RunnableLike<any, any>>;
}

export interface ToolBindingProvider {
  getReasoningToolBoundLLM(
    tools: StructuredTool[],
  ): Promise<BaseChatModel>;
}

export type LlmGateway = ReasoningModelProvider &
  SpeedyModelProvider &
  StructuredOutputProvider &
  ToolBindingProvider;

// -------- Prompt construction --------
export interface PromptPort {
  constructPrompt(
    context: string,
    history: string,
    question: string,
  ): Promise<string> | string;
  buildChatMessages(history: string, question: string): BaseMessage[];
  buildIntentClassificationPrompt(question: string): BaseMessage[];
  buildConversationalMessages(history: string, question: string): BaseMessage[];
}

// -------- Retrieval DTOs --------
export interface SearchMetadata {
  type?: string;
  workspaceId?: string;
  workspaceTitle?: string;
  [key: string]: unknown;
}

export interface SearchDocument {
  pageContent: string;
  metadata?: SearchMetadata;
}

export interface SearchHit {
  doc: SearchDocument;
  score: number;
}

export interface RetrievalPort {
  generateQueryVariations(query: string, llm: BaseChatModel): Promise<string[]>;
  performHybridSearch(
    queries: string[],
    originalQuery: string,
    filters?: Record<string, any>,
  ): Promise<SearchHit[]>;
}

// -------- Generation --------
export interface AnswerPayload {
  answer: string;
  context: string;
  sources?: string[];
}

export interface GenerationPort {
  generateAnswer(
    llm: BaseChatModel,
    prompt: string,
    context: string,
    filteredResults: SearchHit[],
  ): Promise<AnswerPayload>;
}

// -------- Tools --------
export interface ToolRegistry {
  getTools(): {
    list: StructuredTool[];
    byName: Record<string, StructuredTool>;
  };
}

// -------- Message history --------
export interface MessageHistoryPort {
  getRecentHistory(chatId: string, limit: number): Promise<string>;
}

// -------- Engine config --------
export class ChatEngineConfig {
  readonly maxIterations = 5;
  readonly appScopeReply =
    'I can assist with Dev-Collab only, including workspaces, work items, snippets, documentation, and workspace code. Please ask a question related to your application data or workflow.';
}
