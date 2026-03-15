import { Module } from '@nestjs/common';
import { SyncEventService } from './sync-event.service';

import { SyncEventPort } from './ports/sync-event.port';

@Module({
  providers: [{ provide: SyncEventPort, useClass: SyncEventService }],
  exports: [SyncEventPort],
})
export class SyncEventModule {}
