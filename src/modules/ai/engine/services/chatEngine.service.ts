import { Injectable } from '@nestjs/common';
import { AIMessage, BaseMessage, HumanMessage, ToolMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  ChatEngineConfig,
} from '../contracts/ports';
import { IntentSchema, PromptService } from './promptService';
import { RetrievalService } from './retrievalService';
import { GenerationService } from './generationService';
import { ToolService } from './toolService';
import { LlmFactoryService } from '../llms/llmFactory';
import { PrismaMessageStore } from '../adapters/prismaMessageStore';

@Injectable()
export class ChatEngineService {
  constructor(
    private readonly promptService: PromptService,
    private readonly retrievalService: RetrievalService,
    private readonly generationService: GenerationService,
    private readonly toolService: ToolService,
    private readonly llmGateway: LlmFactoryService,
    private readonly historyStore: PrismaMessageStore,
    private readonly config: ChatEngineConfig,
  ) { }

  private async getAIResponseWithTools(chatId: string, question: string, workspaceId: string) {
    const { list: tools, byName: toolsByName } = this.toolService.getTools();

    const llmWithTools = await this.llmGateway.getReasoningToolBoundLLM(tools);
    const history = await this.historyStore.getRecentHistory(chatId, 10);
    const calledTools: string[] = [];

    let messages: BaseMessage[] = this.promptService.buildChatMessages(history, question);

    let iterations = 0;
    while (iterations < this.config.maxIterations) {
      iterations++;
      const response = (await llmWithTools.invoke(messages)) as AIMessage;
      messages = [...messages, response];

      if (!response.tool_calls || response.tool_calls.length === 0) break;

      for (const toolCall of response.tool_calls) {
        calledTools.push(toolCall.name);
        const tool = toolsByName[toolCall.name];
        if (!tool) {
          messages = [
            ...messages,
            new ToolMessage({
              content: `Error: Tool ${toolCall.name} not found.`,
              tool_call_id: toolCall.id!,
            }),
          ];
          continue;
        }
        const result = await tool.invoke({ ...toolCall.args, workspaceId });
        messages = [
          ...messages,
          new ToolMessage({
            content: result,
            tool_call_id: toolCall.id!,
          }),
        ];
      }
    }

    if (calledTools.length === 0) {
      console.log('[Chat Engine] LLM answered directly (no tools called).');
    } else {
      console.log(
        `[Chat Engine] Tools called (${calledTools.length}): ${calledTools.join(' -> ')}`,
      );
    }

    messages = [
      ...messages,
      new HumanMessage(
        "Please provide your final answer to the user's question based on the information gathered.",
      ),
    ];
    const llm = await this.llmGateway.getSpeedyLLM();
    const answer = await llm.pipe(new StringOutputParser()).invoke(messages);
    return { answer, context: '', validated: { isValid: true, warning: null } };
  }

  private async getAIResponseWithSearch(
    chatId: string,
    question: string,
    filters?: Record<string, any>,
  ) {
    const queryGenLlm = await this.llmGateway.getReasoningLLM();

    const queries = await this.retrievalService.generateQueryVariations(question, queryGenLlm);
    const filteredResults = await this.retrievalService.performHybridSearch(
      queries,
      question,
      filters,
    );

    if (filteredResults.length === 0) {
      return {
        answer: `${this.config.appScopeReply} Try referencing a workspace entity like a work item title, snippet filename, or doc label.`,
        context: '',
        validated: { isValid: true, warning: null },
      };
    }

    filteredResults.forEach(([doc, score]: any, i: number) => {
      console.log(
        `Result ${i + 1}: Score: ${score.toFixed(4)}, Type: ${doc.metadata?.type}, Title: ${doc.metadata?.workspaceTitle}`,
      );
    });

    const context =
      filteredResults.length > 0
        ? filteredResults
          .map(([doc]: any) => {
            const type = doc.metadata?.type || 'General Info';
            const title = doc.metadata?.workspaceTitle || 'Unknown Workspace';
            return `--- Source: Information from ${type} within workspace "${title}" ---\n${doc.pageContent}`;
          })
          .join('\n\n')
        : "I don't have enough specific information in my records to answer this fully.";

    const history = await this.historyStore.getRecentHistory(chatId, 10);
    const fullPrompt = await this.promptService.constructPrompt(context, history, question);
    const answerLlm = await this.llmGateway.getSpeedyLLM();
    return this.generationService.generateAnswer(
      answerLlm,
      fullPrompt,
      context,
      filteredResults,
    );
  }

  async getAIResponse(chatId: string, question: string, filters?: Record<string, any>) {
    const classifierLlm = await this.llmGateway.getReasoningStructuredLLM(
      IntentSchema,
      'classify_intent',
    );
    const intentMessages = this.promptService.buildIntentClassificationPrompt(question);

    let intent = 'PROJECT_QUERY';
    let scope: 'APP_SPECIFIC' | 'OUT_OF_SCOPE' = filters?.workspaceId
      ? 'APP_SPECIFIC'
      : 'OUT_OF_SCOPE';

    try {
      const result = await classifierLlm.invoke(intentMessages);
      if (result.confidence > 0.4) {
        intent = result.intent;
        scope = result.scope;
      } else {
        console.warn('[Intent Classification] Low confidence, defaulting to PROJECT_QUERY');
      }
    } catch (e) {
      console.warn('[Intent Classification] Failed, defaulting to PROJECT_QUERY:', e);
    }

    if (intent === 'CONVERSATIONAL') {
      if (scope === 'OUT_OF_SCOPE') {
        return {
          answer: this.config.appScopeReply,
          context: '',
          validated: { isValid: true, warning: null },
        };
      }
      console.log('[Chat Engine] Intent classified as CONVERSATIONAL. Skipping tools/search.');
      const history = await this.historyStore.getRecentHistory(chatId, 10);
      const conversationalMessages = this.promptService.buildConversationalMessages(
        history,
        question,
      );
      const conversationalLlm = await this.llmGateway.getSpeedyLLM();
      const answer = await conversationalLlm
        .pipe(new StringOutputParser())
        .invoke(conversationalMessages);
      return { answer, context: '', validated: { isValid: true, warning: null } };
    }

    if (scope === 'OUT_OF_SCOPE' && !filters?.workspaceId) {
      return {
        answer: this.config.appScopeReply,
        context: '',
        validated: { isValid: true, warning: null },
      };
    }

    if (filters?.workspaceId) {
      return this.getAIResponseWithTools(chatId, question, filters.workspaceId);
    }
    return this.getAIResponseWithSearch(chatId, question, filters);
  }
}
