import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProjectsModule } from './modules/projects/projects.module';
import { UsersModule } from './modules/users/users.module';
import { SnippetsModule } from './modules/snippets/snippets.module';
import { WorkItemsModule } from './modules/work-items/work-items.module';
import { DocsModule } from './modules/docs/docs.module';
import { ChatModule } from './modules/chat/chat.module';
import { AiModule } from './modules/ai/ai.module';
import { MessageModule } from './modules/message/message.module';
import { QueueModule } from './modules/queue/queue.module';
import { LiveblocksModule } from './modules/liveblocks/liveblocks.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';

@Module({
  imports: [
    AuthModule,
    ProjectsModule,
    UsersModule,
    SnippetsModule,
    WorkItemsModule,
    DocsModule,
    ChatModule,
    AiModule,
    MessageModule,
    QueueModule,
    LiveblocksModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
