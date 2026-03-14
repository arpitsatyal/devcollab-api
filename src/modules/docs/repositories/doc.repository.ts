import { Injectable } from '@nestjs/common';
import { eq, ilike, and } from 'drizzle-orm';
import { DrizzleService } from 'src/common/drizzle/drizzle.service';
import { docs } from 'src/common/drizzle/schema';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DocRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  findUnique(id: string) {
    return this.drizzle.db.query.docs.findFirst({
      where: eq(docs.id, id),
    });
  }

  findByRoomId(roomId: string) {
    return this.drizzle.db.query.docs.findFirst({
      where: eq(docs.roomId, roomId),
    });
  }

  findMany(workspaceId: string, limit?: number) {
    const query = this.drizzle.db
      .select()
      .from(docs)
      .where(eq(docs.workspaceId, workspaceId));
    if (limit) return query.limit(limit);
    return query;
  }

  findManyByLabel(workspaceId: string, search: string, limit = 3) {
    return this.drizzle.db
      .select()
      .from(docs)
      .where(and(eq(docs.workspaceId, workspaceId), ilike(docs.label, `%${search}%`)))
      .limit(limit);
  }

  async create(data: { label: string; workspaceId: string; roomId: string }) {
    const [row] = await this.drizzle.db
      .insert(docs)
      .values({ id: uuid(), ...data })
      .returning();
    return row;
  }

  async update(id: string, data: Partial<{ content: unknown; updatedAt: Date }>) {
    const [row] = await this.drizzle.db
      .update(docs)
      .set(data)
      .where(eq(docs.id, id))
      .returning();
    return row;
  }

  async updateByRoomId(roomId: string, data: Partial<{ content: unknown; updatedAt: Date }>) {
    const [row] = await this.drizzle.db
      .update(docs)
      .set(data)
      .where(eq(docs.roomId, roomId))
      .returning();
    return row;
  }

  async delete(id: string) {
    const [row] = await this.drizzle.db
      .delete(docs)
      .where(eq(docs.id, id))
      .returning();
    return row;
  }
}
