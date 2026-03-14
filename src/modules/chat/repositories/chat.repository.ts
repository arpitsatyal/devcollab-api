import { Injectable } from '@nestjs/common';
import { eq, desc, asc } from 'drizzle-orm';
import { DrizzleService } from 'src/common/drizzle/drizzle.service';
import { chats, messages } from 'src/common/drizzle/schema';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ChatRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  findUnique(id: string) {
    return this.drizzle.db.query.chats.findFirst({
      where: eq(chats.id, id),
      with: { messages: { orderBy: asc(messages.createdAt) } },
    });
  }

  findManyBySender(senderId: string) {
    return this.drizzle.db.query.chats.findMany({
      where: eq(chats.senderId, senderId),
      orderBy: [desc(chats.updatedAt)],
      with: { messages: true },
    });
  }

  async create(senderId: string) {
    const now = new Date();
    const [row] = await this.drizzle.db
      .insert(chats)
      .values({ id: uuid(), senderId, createdAt: now, updatedAt: now })
      .returning();
    return row;
  }

  async update(id: string, data: Partial<{ title: string; updatedAt: Date }>) {
    const [row] = await this.drizzle.db
      .update(chats)
      .set(data)
      .where(eq(chats.id, id))
      .returning();
    return row;
  }

  async delete(id: string) {
    const [row] = await this.drizzle.db
      .delete(chats)
      .where(eq(chats.id, id))
      .returning();
    return row;
  }
}
