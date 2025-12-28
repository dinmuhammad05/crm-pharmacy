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
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DailyIncomeService } from './daily-income.service';
import { CreateDailyIncomeDto } from './dto/create-daily-income.dto';
import { UpdateDailyIncomeDto } from './dto/update-daily-income.dto';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { accessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { PaginationQueryDto } from 'src/common/dto/query.dto';
import { ILike, Raw } from 'typeorm';

@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Daily Income')
@Controller('daily-income')
export class DailyIncomeController {
  constructor(private readonly dailyIncomeService: DailyIncomeService) {}

  @ApiOperation({ summary: 'Kunlik daromad qo‘shish' })
  @ApiResponse({
    status: 201,
    description: 'Kunlik daromad muvaffaqiyatli qo‘shildi',
  })
  @Post()
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  create(@Body() createDailyIncomeDto: CreateDailyIncomeDto) {
    return this.dailyIncomeService.create(createDailyIncomeDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.dailyIncomeService.findAllWithPagination({
      where: query.query
        ? {
            createdAt: Raw((alias) => `CAST(${alias} AS TEXT) ILike :value`, {
              value: `%${query.query}%`,
            }),
          }
        : {},
      skip: query.page,
      take: query.pageSize,
    });
  }

  @ApiOperation({ summary: 'ID bo‘yicha kunlik daromadni olish' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Topilgan kunlik daromad' })
  @ApiResponse({ status: 404, description: 'Kunlik daromad topilmadi' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dailyIncomeService.findOneById(id);
  }

  @ApiOperation({ summary: 'Kunlik daromadni yangilash' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Kunlik daromad yangilandi' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDailyIncomeDto: UpdateDailyIncomeDto,
  ) {
    return this.dailyIncomeService.update(id, updateDailyIncomeDto);
  }

  // kunlik daromadni to'gatish
  @ApiOperation({ summary: 'Kunlik daromadni to‘gatish' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Kunlik daromad to‘gatildi' })
  @accessRoles(Roles.SUPER_ADMIN)
  @Patch(':id/disactive')
  disactive(@Param('id') id: string) {
    return this.dailyIncomeService.disactive(id);
  }

  @ApiOperation({ summary: 'Kunlik daromadni o‘chirish' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Kunlik daromad o‘chirildi' })
  @accessRoles(Roles.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dailyIncomeService.delete(id);
  }
}
