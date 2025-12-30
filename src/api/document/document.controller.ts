import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { accessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { PaginationQueryDto } from 'src/common/dto/query.dto';
import { ILike } from 'typeorm';

@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @ApiOperation({ summary: 'Create document' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  findAll(@Query() query: PaginationQueryDto) {
    return this.documentService.findAllWithPagination({
      skip: query.page,
      take: query.pageSize,
      where: query.query ? { clientFullname: ILike(`%${query.query}%`) } : {},
      order: { createdAt: 'DESC' },
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.documentService.delete(id);
  }
}
