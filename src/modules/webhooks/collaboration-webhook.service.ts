import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CollaborationPort } from '../collaboration/ports/collaboration.port';
import { QueuePort } from 'src/modules/queue/ports/queue.port';
import { UserRepository } from '../users/repositories/user.repository';
import { DocRepository } from '../docs/repositories/doc.repository';

@Injectable()
export class CollaborationWebhookService {
  private readonly logger = new Logger(CollaborationWebhookService.name);

  constructor(
    private readonly collaborationClient: CollaborationPort,
    private readonly queueClient: QueuePort,
    private readonly userRepo: UserRepository,
    private readonly docRepo: DocRepository,
  ) { }

  async handleWebhook(payload: any): Promise<{ message: string }> {
    const { type, data } = payload || {};

    // if (type === 'notification' && data?.kind === 'textMention') {
    //   return await this.handleTextMentionNotification(data, payload);
    // }

    if (type === 'ydocUpdated') {
      return await this.handleYdocUpdated(data);
    }

    return { message: 'No relevant action taken.' };
  }

  // private async handleTextMentionNotification(data: any, payload: any) {
  //   const user = await this.userRepo.findById(data.userId);

  //   if (!user?.email) {
  //     this.logger.warn(`No email found for userId: ${data.userId}`);
  //     throw new BadRequestException('No email address found.');
  //   }

  //   let emailData;
  //   try {
  //     emailData = await prepareTextMentionNotificationEmailAsReact(
  //       this.liveblocks,
  //       payload,
  //       {
  //         resolveUsers: async ({ userIds }) => {
  //           const usersData = await this.userRepo.findManyByIds(userIds);

  //           const userMap = new Map(usersData.map((u) => [u.id, u]));
  //           return userIds
  //             .map((id) => userMap.get(id))
  //             .filter(Boolean)
  //             .map((userData) => ({
  //               name: userData?.name ?? '',
  //               avatar: userData?.image ?? '',
  //               color: '0074C2',
  //               email: userData?.email ?? '',
  //             }));
  //         },
  //       },
  //     );
  //   } catch (error) {
  //     this.logger.error('Email preparation failed', error);
  //     throw new InternalServerErrorException(
  //       'Failed to prepare notification email.',
  //     );
  //   }

  //   if (!emailData) {
  //     return { message: 'Mention is already read. No notification sent.' };
  //   }

  //   const { mention } = emailData;
  //   const [author, doc] = await Promise.all([
  //     this.userRepo.findById(mention.author.id),
  //     this.docRepo.findByRoomId(mention.roomId),
  //   ]);

  //   try {
  //     await this.queueClient.sendMessage({
  //       assigneeEmail: user.email,
  //       content: mention.content,
  //       mentionUrl: `https://www.devcollab.store/workspaces/${doc?.workspaceId}/docs?docId=${doc?.id}`,
  //       label: doc?.label,
  //       authorName: author?.name,
  //     });
  //   } catch (error) {
  //     this.logger.warn(
  //       `Queue message failed for mention: ${error?.message || error}`,
  //     );
  //   }

  //   return { message: 'Text mention notification processed successfully.' };
  // }

  private async handleYdocUpdated(data: any) {
    try {
      const content = await this.collaborationClient.getYdocContent(data.roomId);

      if (!content) {
        this.logger.log(`No content received for roomId: ${data.roomId}`);
        return { message: 'No document content to save.' };
      }

      await this.docRepo.updateByRoomId(data.roomId, { content });

      return { message: 'Document content updated successfully.' };
    } catch (error) {
      this.logger.error(`Failed to update YDoc: ${error?.message || error}`);
      throw new InternalServerErrorException(
        'Failed to update document content.',
      );
    }
  }
}
