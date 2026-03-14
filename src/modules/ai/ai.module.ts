import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { AiController } from './controllers/ai.controller';
import { ChatEngineService } from './services/chatEngine.service';
import { SuggestionService } from './services/suggestionService';
import { GenerationService } from './services/generationService';
import { PromptService } from './services/promptService';
import { RetrievalService } from './services/retrievalService';
import { ToolService } from './services/toolService';
import { MessageModule } from '../message/message.module';
import { WorkItemsModule } from '../work-items/work-items.module';
import { ChatHistoryRepository } from './repositories/chat-history.repository';
import { SnippetRepository } from '../snippets/repositories/snippet.repository';
import { DocRepository } from '../docs/repositories/doc.repository';
import { WorkItemRepository } from '../work-items/repositories/work-item.repository';
import { LangGraphService } from './services/lang-graph.service';
import { LlmModule } from './llms/llm.module';
import { VectorModule } from './pinecone/vector.module';
import { ChatEngineConfig } from './contracts/ports';
import { MessageHistoryService } from './services/messageHistoryService';

@Module({
  imports: [MessageModule, WorkItemsModule, LlmModule, VectorModule],
  providers: [
    AiService,
    ChatEngineService,
    SuggestionService,
    GenerationService,
    PromptService,
    RetrievalService,
    ToolService,
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
