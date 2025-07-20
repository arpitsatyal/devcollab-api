import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { SessionAuthGuard } from 'src/common/guards/auth.guard';
import { CreateProjectDto } from './projects.dto';
import { CurrentUser } from 'src/modules/users/user.decorator';
import { User } from '@prisma/client';

@Controller('projects')
// @UseGuards(SessionAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  getProjects(@Query() query: PaginationQueryDto, @CurrentUser() user: User) {
    const skip = parseInt(query.skip ?? '0');
    const take = parseInt(query.limit ?? '10');

    return this.projectsService.getProjects({ user, skip, take });
  }

  @Get(':id')
  getProject(@Param('id') id: string) {
    return this.projectsService.getProject(id);
  }

  @Post()
  addNewProject(@Body() body: CreateProjectDto, @CurrentUser() user: User) {
    return this.projectsService.addNewProject(body, user);
  }

  @Patch()
  togglePinProject(
    @Param('id') id: string,
    @Body() body: { isPinned: boolean },
    @CurrentUser() user: User,
  ) {
    return this.projectsService.togglePinProject(body, user, id);
  }
}
