import { Injectable } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { DrizzleService } from 'src/common/drizzle/drizzle.service';
import { messages } from 'src/common/drizzle/schema';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MessageRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  findUnique(id: string) {
    return this.drizzle.db.query.messages.findFirst({
      where: eq(messages.id, id),
    });
  }

  findMany(chatId: string) {
    return this.drizzle.db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(asc(messages.createdAt));
  }

  async create(args: { data: { chatId: string; content: string; isUser: boolean } }) {
    const { chatId, content, isUser } = args.data;
    const [row] = await this.drizzle.db
      .insert(messages)
      .values({ id: uuid(), chatId, content, isUser })
      .returning();
    return row;
  }

  async update(args: { where: { id: string }; data: Partial<{ content: string; isUser: boolean }> }) {
    const [row] = await this.drizzle.db
      .update(messages)
      .set(args.data)
      .where(eq(messages.id, args.where.id))
      .returning();
    return row;
  }

  async delete(args: { where: { id: string } }) {
    const [row] = await this.drizzle.db
      .delete(messages)
      .where(eq(messages.id, args.where.id))
      .returning();
    return row;
  }
}
