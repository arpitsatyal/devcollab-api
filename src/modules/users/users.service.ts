import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { UserRepository } from './repositories/user.repository';

interface CreateUserDTO {
  email: string;
  name: string;
  provider: 'GOOGLE' | 'GITHUB' | 'LOCAL';
  image?: string;
}

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private readonly userRepo: UserRepository,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepo.findUnique({
      where: { email },
    });

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepo.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException(`No user found with id: ${id}`);
    return user;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepo.findMany();
  }

  async searchByName(text: string): Promise<string[]> {
    const decodedText = decodeURIComponent(text).trim().toLowerCase();
    const users = await this.userRepo.findMany();

    return users
      .filter(
        (user) => user.name && user.name.toLowerCase().includes(decodedText),
      )
      .map((user) => user.id);
  }

  async getStatsByEmail(email: string) {
    const user = await this.userRepo.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const [workspacesCount, snippetsCount, docsCount, workItemsCount] =
      await Promise.all([
        this.prismaService.workspace.count({ where: { ownerId: user.id } }),
        this.prismaService.snippet.count({ where: { authorId: user.id } }),
        this.prismaService.doc.count({
          where: { workspace: { ownerId: user.id } },
        }),
        this.prismaService.workItem.count({
          where: { workspace: { ownerId: user.id } },
        }),
      ]);

    return {
      workspaces: workspacesCount,
      snippets: snippetsCount,
      docs: docsCount,
      workItems: workItemsCount,
    };
  }

  async getLiveblocksUsers(userIds: string[]) {
    const users = await this.prismaService.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    return userIds
      .map((id) => userMap.get(id))
      .filter(Boolean)
      .map((user: any) => ({
        id: user?.id ?? user?.email,
        name: user?.name || 'Unknown',
        email: user?.email || '',
        avatar: user?.image || '',
        color: '#0074C2',
      }));
  }

  async createUser(createUserDTO: CreateUserDTO) {
    return this.userRepo.create({
      data: {
        email: createUserDTO.email,
        name: createUserDTO.name,
        provider: createUserDTO.provider,
        image: createUserDTO.image,
      },
    });
  }
}
