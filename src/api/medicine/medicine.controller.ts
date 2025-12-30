import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Patch,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MedicineService } from './medicine.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { Roles } from 'src/common/enum/roles.enum';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { accessRoles } from 'src/common/decorator/roles.decorator';
import { PaginationQueryDto } from 'src/common/dto/query.dto';
import { ILike, IsNull, Like } from 'typeorm';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { UpdateManyMedicineDto } from './dto/update-many-medicines';

@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Medicine')
@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  // 1. Excel Upload
  @Post('upload')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Excel fayl yuklash va bazaga yozish' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.medicineService.processExcel(file);
  }

  // 2. Bitta dori qo'shish
  @Post('create-one')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN) // Kerak bo'lsa rolni o'zgartiring
  @ApiOperation({ summary: "Bitta dori qo'shish" })
  async createOne(@Body() dto: CreateMedicineDto) {
    return this.medicineService.createOne(dto);
  }

  // 3. Bir nechta dori qo'shish (Massiv)
  @Post('create-many')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: "Bir nechta dori qo'shish (Massiv)" })
  @ApiBody({ type: [CreateMedicineDto] })
  async createMany(@Body() dtos: CreateMedicineDto[]) {
    return this.medicineService.createMany(dtos);
  }

  // 4. Foizni o'zgartirish
  @Patch('update-global-markup')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: "Foizni o'zgartirish" })
  async updateGlobalMarkup(@Body('percent') percent: number) {
    return this.medicineService.updateGlobalMarkup(percent);
  }

  @Get('list-all')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Dori listini olish' })
  async getMedicineList(
    @Query()
    query: PaginationQueryDto & {
      onlyWithoutUnitCount?: string;
      onlyWithCount?: string;
    },
  ) {
    return this.medicineService.findAllWithPagination({
      skip: query.page,
      take: query.pageSize,
      where: {
        name: query.query ? ILike(`%${query.query}%`) : undefined,
        unitCount: query.onlyWithoutUnitCount === 'true' ? 1 : undefined,
        quantity: query.onlyWithCount === 'true' ? 0 : undefined,
      },
      order: { name: 'ASC' },
    });
  }

  // bitta medicinini olish
  @Get('get-one/:id')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bitta dori olish' })
  async getOne(@Param('id') id: string) {
    return this.medicineService.findOneById(id, {
      relations: { histories: true },
    });
  }

  // supply historyni olish pagination hisoblab getSupplyHistoryWithPagination
  @Get('supply-history')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Supply history olish' })
  async getSupplyHistory(@Query() queryDto: PaginationQueryDto) {
    let { page, pageSize, query } = queryDto;
    return this.medicineService.getSuplyInvoiceWithPagination(
      page,
      pageSize,
      query,
    );
  }

  @Get('supply-history/:id')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  async getInvoiceDetail(@Param('id') id: string) {
    return this.medicineService.getInvoiceById(id);
  }

  // dorilarni update qilish
  @Patch('update-medicines/:id')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Dorilarni update qilish' })
  async updateMedicines(
    @Param('id') id: string,
    @Body() medicines: UpdateMedicineDto,
  ) {
    return this.medicineService.update(id, medicines);
  }

  // bir nechta dorilarni update qilish
  @Patch('update-multiple-unitcounts')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bir nechta dorilarni update qilish' })
  async updateMultipleMedicines(@Body() medicines: UpdateManyMedicineDto[]) {
    return this.medicineService.updateMultipleMedicines(medicines);
  }
}
