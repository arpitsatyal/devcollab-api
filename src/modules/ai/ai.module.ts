import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { AiController } from './controllers/ai.controller';
import { ChatEngineService } from './services/chatEngine.service';
import { SuggestionService } from './services/suggestionService';
import { GenerationService } from './services/generationService';
import { PromptService } from './services/promptService';
import { RetrievalService } from './services/retrievalService';
import { ToolService } from './services/toolService';
import { LlmFactoryService } from './llms/llmFactory';
import { TogetherLlmService } from './llms/togetherLLM';
import { GroqLlmService } from './llms/groqLLM';
import { VectorStoreService } from './pinecone/vectorStore';
import { ChatEngineConfig } from './contracts/ports';
import { MessageHistoryService } from './services/messageHistoryService';
import { MessageModule } from '../message/message.module';
import { WorkItemsModule } from '../work-items/work-items.module';
import { ChatHistoryRepository } from './repositories/chat-history.repository';
import { SnippetRepository } from '../snippets/repositories/snippet.repository';
import { DocRepository } from '../docs/repositories/doc.repository';
import { WorkItemRepository } from '../work-items/repositories/work-item.repository';
import { LangGraphService } from './services/lang-graph.service';

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
    MessageHistoryService,
    ChatHistoryRepository,
    SnippetRepository,
    DocRepository,
    WorkItemRepository,
    LangGraphService,
  ],
  controllers: [AiController],
})
export class AiModule {}
