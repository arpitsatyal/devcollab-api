import { Injectable } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { DrizzleService } from 'src/common/drizzle/drizzle.service';
import { workspaces, userPinnedWorkspaces } from 'src/common/drizzle/schema';
import { v4 as uuid } from 'uuid';

@Injectable()
export class WorkspaceRepository {
  constructor(private readonly drizzle: DrizzleService) { }

  findById(id: string) {
    return this.drizzle.db.query.workspaces.findFirst({
      where: eq(workspaces.id, id),
    });
  }

  findMany(skip = 0, take = 20) {
    return this.drizzle.db.query.workspaces.findMany({
      offset: skip,
      limit: take,
    });
  }

  findManyRaw(userId: string, skip = 0, take = 20) {
    return this.drizzle.db.execute(
      sql`
        SELECT w.*,
              (uww."userId" IS NOT NULL) AS "isPinned"
        FROM "Workspace" w
        LEFT JOIN "UserPinnedWorkspace" uww
          ON uww."userId" = ${userId}
          AND uww."workspaceId" = w."id"
        ORDER BY "isPinned" DESC, w."createdAt" DESC
        OFFSET ${skip}
        LIMIT ${take}
      `,
    );
  }

  async create(data: { title: string; description?: string | null; ownerId: string }) {
    const now = new Date();
    const [row] = await this.drizzle.db
      .insert(workspaces)
      .values({ id: uuid(), ...data, createdAt: now, updatedAt: now })
      .returning();
    return row;
  }

  async upsertPin(userId: string, workspaceId: string) {
    // Check if pin exists
    const existing = await this.drizzle.db.query.userPinnedWorkspaces.findFirst({
      where: and(
        eq(userPinnedWorkspaces.userId, userId),
        eq(userPinnedWorkspaces.workspaceId, workspaceId),
      ),
    });
    if (!existing) {
      await this.drizzle.db
        .insert(userPinnedWorkspaces)
        .values({ id: uuid(), userId, workspaceId });
    }
  }

  async deletePin(userId: string, workspaceId: string) {
    await this.drizzle.db
      .delete(userPinnedWorkspaces)
      .where(
        and(
          eq(userPinnedWorkspaces.userId, userId),
          eq(userPinnedWorkspaces.workspaceId, workspaceId),
        ),
      );
  }

  async update(id: string, data: Partial<{ title: string; description: string; isPublic: boolean }>) {
    const [row] = await this.drizzle.db
      .update(workspaces)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workspaces.id, id))
      .returning();
    return row;
  }

  async delete(id: string) {
    const [row] = await this.drizzle.db
      .delete(workspaces)
      .where(eq(workspaces.id, id))
      .returning();
    return row;
  }
}
