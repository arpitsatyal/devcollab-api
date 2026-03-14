import { Injectable } from '@nestjs/common';
import { eq, ilike, or, and } from 'drizzle-orm';
import { DrizzleService } from 'src/common/drizzle/drizzle.service';
import { snippets } from 'src/common/drizzle/schema';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SnippetRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  findUnique(id: string) {
    return this.drizzle.db.query.snippets.findFirst({
      where: eq(snippets.id, id),
    });
  }

  findMany(workspaceId: string, limit?: number) {
    const query = this.drizzle.db
      .select()
      .from(snippets)
      .where(eq(snippets.workspaceId, workspaceId));
    if (limit) return query.limit(limit);
    return query;
  }

  findManyBySearch(workspaceId: string, search: string, limit = 3) {
    return this.drizzle.db
      .select()
      .from(snippets)
      .where(
        and(
          eq(snippets.workspaceId, workspaceId),
          or(
            ilike(snippets.title, `%${search}%`),
            ilike(snippets.content, `%${search}%`),
          ),
        ),
      )
      .limit(limit);
  }

  async create(data: {
    title: string;
    language: string;
    content: string;
    extension?: string;
    workspaceId: string;
    authorId?: string;
  }) {
    const [row] = await this.drizzle.db
      .insert(snippets)
      .values({ id: uuid(), ...data })
      .returning();
    return row;
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      language: string;
      content: string;
      extension: string;
      lastEditedById: string;
      updatedAt: Date;
    }>,
  ) {
    const [row] = await this.drizzle.db
      .update(snippets)
      .set(data)
      .where(eq(snippets.id, id))
      .returning();
    return row;
  }

  async delete(id: string) {
    const [row] = await this.drizzle.db
      .delete(snippets)
      .where(eq(snippets.id, id))
      .returning();
    return row;
  }
}
