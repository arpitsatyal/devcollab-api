import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

interface CreateUserDTO {
  email: string;
  name: string;
  provider: 'GOOGLE' | 'GITHUB' | 'LOCAL';
  image?: string;
}

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) throw new NotFoundException(`No user found with id: ${id}`);
    return user;
  }

  async create(createUserDTO: CreateUserDTO) {
    return await this.prismaService.user.create({
      data: {
        email: createUserDTO.email,
        name: createUserDTO.name,
        provider: createUserDTO.provider,
        image: createUserDTO.image,
      },
    });
  }
}
