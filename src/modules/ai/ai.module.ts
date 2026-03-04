import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { AiController } from './controllers/ai.controller';
import { PrismaService } from 'src/common/services/prisma.service';
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
import { PrismaMessageStore } from './engine/adapters/prismaMessageStore';

@Module({
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
    PrismaMessageStore,
    PrismaService,
  ],
  controllers: [AiController],
})
export class AiModule {}
