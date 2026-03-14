import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { AiController } from './controllers/ai.controller';
import { ChatEngineService } from './engine/services/chatEngine.service';
import { SuggestionService } from './engine/services/suggestionService';
import { GenerationService } from './engine/services/generationService';
import { PromptService } from './engine/services/promptService';
import { RetrievalService } from './engine/services/retrievalService';
import { ToolService } from './engine/services/toolService';
import { LlmFactoryService } from './engine/llms/llmFactory';
import { TogetherLlmService } from './engine/llms/togetherLLM';
import { GroqLlmService } from './engine/llms/groqLLM';
import { VectorStoreService } from './engine/pinecone/vectorStore';
import { ChatEngineConfig } from './engine/contracts/ports';
import { DrizzleMessageStore } from './engine/adapters/drizzleMessageStore';
import { MessageModule } from '../message/message.module';
import { WorkItemsModule } from '../work-items/work-items.module';
import { ChatHistoryRepository } from './engine/repositories/chat-history.repository';
import { SnippetRepository } from '../snippets/repositories/snippet.repository';
import { DocRepository } from '../docs/repositories/doc.repository';
import { WorkItemRepository } from '../work-items/repositories/work-item.repository';
import { LangGraphService } from './engine/services/lang-graph.service';

@Module({
  imports: [MessageModule, WorkItemsModule],
  providers: [
    AiService,
    ChatEngineService,
    SuggestionService,
    GenerationService,
    PromptService,
    RetrievalService,
    ToolService,
    LlmFactoryService,
    TogetherLlmService,
    GroqLlmService,
    VectorStoreService,
    ChatEngineConfig,
    DrizzleMessageStore,
    ChatHistoryRepository,
    SnippetRepository,
    DocRepository,
    WorkItemRepository,
    LangGraphService,
  ],
  controllers: [AiController],
})
export class AiModule {}
