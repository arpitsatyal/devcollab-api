import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { DocsService } from './docs.service';
import { DocCreateDto, DocUpdateDto } from './docs.dto';

@Controller('projects/:projectId/docs')
// @UseGuards(SessionAuthGuard)
export class DocsController {
  constructor(private docsService: DocsService) {}

  @Get()
  getDocs(@Param('projectId') projectId: string) {
    return this.docsService.getDocs(projectId);
  }

  @Get(':docId')
  getDocById(@Param('docId') docId: string) {
    return this.docsService.getDoc(docId);
  }

  @Post()
  createDoc(@Param('projectId') projectId: string, @Body() dto: DocCreateDto) {
    return this.docsService.createDoc(projectId, dto);
  }

  @Patch(':docId')
  updateDoc(@Param('docId') docId: string, @Body() dto: DocUpdateDto) {
    return this.docsService.updateDoc(docId, dto);
  }
}
