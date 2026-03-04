import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@upstash/qstash';

export type EventType = 'workspace' | 'workItem' | 'snippet' | 'doc';

@Injectable()
export class QstashService {
  private readonly logger = new Logger(QstashService.name);
  private readonly client = new Client({ token: process.env.QSTASH_TOKEN! });
  private readonly appUrl = process.env.APP_URL;

  async publishSyncEvent(
    type: EventType,
    data: any,
    action: 'upsert' | 'delete' = 'upsert',
  ) {
    const webhookUrl = `${this.appUrl}/api/webhooks/vector-sync`;

    try {
      const result = await this.client.publishJSON({
        queue: 'vector-sync-queue',
        url: webhookUrl,
        body: { type, data: { id: data.id }, action },
        contentBasedDeduplication: true,
        retries: 3,
      });

      this.logger.log(`[QStash] Published messageId: ${result.messageId}`);
      return result.messageId;
    } catch (err) {
      this.logger.warn(
        `[QStash] Failed to publish sync event for ${type}: ${data.id} -> ${err?.message || err}`,
      );
    }
  }
}
