import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PaginationQueryDto } from 'src/DTO/PaginationQueryDTO';
import { AuthGuard } from 'src/Guards/AuthGuard';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get(':id')
  getProject(@Param('id') id: string) {
    return this.projectsService.getProject(id);
  }

  @Get()
  @UseGuards(AuthGuard)
  getProjects(@Query() query: PaginationQueryDto) {
    const skip = parseInt(query.skip ?? '0');
    const take = parseInt(query.limit ?? '10');

    return this.projectsService.getProjects({ skip, take });
  }
}
