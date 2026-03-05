import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUnique(args: Prisma.UserFindUniqueArgs) {
    return this.prisma.user.findUnique(args);
  }

  findMany(args?: Prisma.UserFindManyArgs) {
    return this.prisma.user.findMany(args);
  }

  create(args: Prisma.UserCreateArgs) {
    return this.prisma.user.create(args);
  }

  update(args: Prisma.UserUpdateArgs) {
    return this.prisma.user.update(args);
  }

  delete(args: Prisma.UserDeleteArgs) {
    return this.prisma.user.delete(args);
  }
}
