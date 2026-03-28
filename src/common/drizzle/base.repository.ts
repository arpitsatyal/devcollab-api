import { Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { DrizzleService } from './drizzle.service';
import { v4 as uuid } from 'uuid';

export abstract class BaseRepository<
  TTable extends PgTable & { id: any },
  TInsert extends Record<string, any> = any,
  TUpdate extends Record<string, any> = Partial<TInsert>,
> {
  constructor(
    protected readonly drizzle: DrizzleService,
    protected readonly table: TTable,
  ) {}

  async findById(id: string): Promise<any> {
    const [row] = await this.drizzle.db
      .select()
      .from(this.table as any)
      .where(eq((this.table as any).id, id));
    return row;
  }

  async findMany() {
    return this.drizzle.db.select().from(this.table as any);
  }

  async findManyByIds(ids: string[]) {
    if (!ids.length) return [];
    return this.drizzle.db
      .select()
      .from(this.table as any)
      .where(inArray((this.table as any).id, ids));
  }

  async create(data: TInsert) {
    const insertData = { id: uuid(), ...data };
    
    // Auto-inject createdAt and updatedAt if present
    if ('createdAt' in this.table) {
      (insertData as any).createdAt = new Date();
    }
    if ('updatedAt' in this.table) {
      (insertData as any).updatedAt = new Date();
    }

    const [row] = await this.drizzle.db
      .insert(this.table as any)
      .values(insertData as any)
      .returning();
    return row;
  }

  async update(id: string, data: TUpdate) {
    const updateData = { ...data };
    
    // Auto-inject updatedAt if present
    if ('updatedAt' in this.table) {
      (updateData as any).updatedAt = new Date();
    }

    const [row] = await this.drizzle.db
      .update(this.table as any)
      .set(updateData as any)
      .where(eq((this.table as any).id, id))
      .returning();
    return row;
  }

  async delete(id: string) {
    const [row] = await this.drizzle.db
      .delete(this.table as any)
      .where(eq((this.table as any).id, id))
      .returning();
    return row;
  }
}
