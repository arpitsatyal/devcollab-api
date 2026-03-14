import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { AiController } from './controllers/ai.controller';
import { ChatEngineService } from './services/chatEngine.service';
import { SuggestionService } from './services/suggestionService';
import { MessageModule } from '../message/message.module';
import { WorkItemsModule } from '../work-items/work-items.module';
import { ChatHistoryRepository } from './repositories/chat-history.repository';
import { SnippetRepository } from '../snippets/repositories/snippet.repository';
import { DocRepository } from '../docs/repositories/doc.repository';
import { WorkItemRepository } from '../work-items/repositories/work-item.repository';
import { LangGraphService } from './services/lang-graph.service';
import { LlmModule } from './llms/llm.module';
import { VectorModule } from './pinecone/vector.module';
import { AiConfig } from './ai.config';
import { MessageHistoryService } from './services/messageHistoryService';
import { GenerationPort } from './interfaces/generation.port';
import { PromptPort } from './interfaces/prompt.port';
import { ToolRegistry } from './interfaces/tool.port';
import { RetrievalPort } from './interfaces/retrieval.port';
import { MessageHistoryPort } from './interfaces/history.port';
import { GenerationService } from './services/generationService';
import { PromptService } from './services/promptService';
import { RetrievalService } from './services/retrievalService';
import { ToolService } from './services/toolService';

@Module({
  imports: [MessageModule, WorkItemsModule, LlmModule, VectorModule],
  providers: [
    AiConfig,
    AiService,
    ChatEngineService,
    SuggestionService,
    LangGraphService,
    { provide: GenerationPort, useClass: GenerationService },
    { provide: PromptPort, useClass: PromptService },
    { provide: RetrievalPort, useClass: RetrievalService },
    { provide: ToolRegistry, useClass: ToolService },
    { provide: MessageHistoryPort, useClass: MessageHistoryService },
    ChatHistoryRepository,
    SnippetRepository,
    DocRepository,
    WorkItemRepository
  ],
  controllers: [AiController],
})
export class AiModule { }
