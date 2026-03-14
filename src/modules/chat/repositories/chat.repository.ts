import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUnique(args: Prisma.ChatFindUniqueArgs) {
    return this.prisma.chat.findUnique(args);
  }

  findMany(args?: Prisma.ChatFindManyArgs) {
    return this.prisma.chat.findMany(args);
  }

  create(args: Prisma.ChatCreateArgs) {
    return this.prisma.chat.create(args);
  }

  update(args: Prisma.ChatUpdateArgs) {
    return this.prisma.chat.update(args);
  }

  delete(args: Prisma.ChatDeleteArgs) {
    return this.prisma.chat.delete(args);
  }
}
