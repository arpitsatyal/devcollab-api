import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@upstash/qstash';
import { SyncEventPort, EventType } from './ports/sync-event.port';
import axios from 'axios';
import { DrizzleService } from '../drizzle/drizzle.service';
import { ConfigService } from '@nestjs/config';
import { workspaces } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class SyncEventService implements SyncEventPort {
  private readonly logger = new Logger(SyncEventService.name);
  private readonly client: Client;
  private readonly appUrl: string;
  private readonly meiliUrl: string | undefined;

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly configService: ConfigService,
  ) {
    this.client = new Client({
      token: this.configService.getOrThrow<string>('QSTASH_TOKEN'),
    });
    this.appUrl = this.configService.getOrThrow<string>('APP_URL');
    this.meiliUrl = this.configService.get<string>('MEILISEARCH_SYNC_URL');
  }

  async publishSyncEvent(
    type: EventType,
    data: any,
    action: 'upsert' | 'delete' = 'upsert',
  ) {
    const webhookUrl = `${this.appUrl}/api/webhooks/vector-sync`;

    let messageId: string | undefined = undefined;

    try {
      const result = await this.client.publishJSON({
        queue: 'vector-sync-queue',
        url: webhookUrl,
        body: { type, data: { id: data.id }, action },
        contentBasedDeduplication: true,
        retries: 3,
      });

      this.logger.log(`[QStash] Published messageId: ${result.messageId}`);
      messageId = result.messageId;
    } catch (err) {
      this.logger.warn(
        `[QStash] Failed to publish sync event for ${type}: ${data.id} -> ${err?.message || err}`,
      );
    }

    this.logger.log('syncing meilisearch.....')
    if (action === 'upsert') {
      try {
        if (this.meiliUrl) {
          // Replicate frontend payload format which attaches the workspace object
          let syncDoc = { ...data };
          if (data.workspaceId) {
            const workspace = await this.drizzle.db.query.workspaces.findFirst({
              where: eq(workspaces.id, data.workspaceId),
            });
            if (workspace) {
              syncDoc.workspace = workspace;
            }
          }

          await axios.post(
            this.meiliUrl,
            { doc: syncDoc, type },
            { headers: { 'Content-Type': 'application/json' } },
          );
          this.logger.log(`[MeiliSearch] Synced ${type} ${data.id}`);
        }
      } catch (err) {
        this.logger.warn(`[MeiliSearch] Failed to sync ${type}: ${data.id} -> ${err?.message || err}`);
      }
    }

    return messageId;
  }
}
