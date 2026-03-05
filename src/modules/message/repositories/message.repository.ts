import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUnique(args: { where: { id: string }; select?: any; include?: any }) {
    return this.prisma.message.findUnique(args);
  }

  findMany(args: Prisma.MessageFindManyArgs) {
    return this.prisma.message.findMany(args);
  }

  create(args: { data: { chatId: string; content: string; isUser: boolean } }) {
    const { chatId, ...rest } = args.data;
    return this.prisma.message.create({
      data: {
        ...rest,
        chat: { connect: { id: chatId } },
      },
    });
  }

  update(args: { where: { id: string }; data: Prisma.MessageUpdateInput }) {
    return this.prisma.message.update(args);
  }

  delete(args: { where: { id: string } }) {
    return this.prisma.message.delete(args);
  }
}
