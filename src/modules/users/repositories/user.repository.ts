import { Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { DrizzleService } from 'src/common/drizzle/drizzle.service';
import { users } from 'src/common/drizzle/schema';
import { v4 as uuid } from 'uuid';

type Provider = 'GOOGLE' | 'GITHUB' | 'LOCAL';

@Injectable()
export class UserRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  findByEmail(email: string) {
    return this.drizzle.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  findById(id: string) {
    return this.drizzle.db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  findMany() {
    return this.drizzle.db.select().from(users);
  }

  findManyByIds(ids: string[]) {
    return this.drizzle.db
      .select()
      .from(users)
      .where(inArray(users.id, ids));
  }

  async create(data: {
    email: string;
    name: string;
    provider: Provider;
    image?: string;
  }) {
    const [row] = await this.drizzle.db
      .insert(users)
      .values({ id: uuid(), ...data })
      .returning();
    return row;
  }

  async update(id: string, data: Partial<{ name: string; email: string; image: string }>) {
    const [row] = await this.drizzle.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return row;
  }

  async delete(id: string) {
    const [row] = await this.drizzle.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return row;
  }
}
