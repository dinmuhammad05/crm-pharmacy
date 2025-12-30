import { Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { BaseService } from 'src/infrastructure/baseService';
import { Document } from 'src/core/entity/document.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DocumentService extends BaseService<
  CreateDocumentDto,
  UpdateDocumentDto,
  Document
> {
  constructor(
    @InjectRepository(Document) private documentRepo: Repository<Document>,
  ) {
    super(documentRepo, 'documents');
  }
}
