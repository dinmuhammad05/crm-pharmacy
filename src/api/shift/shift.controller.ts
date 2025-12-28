import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { PaginationQueryDto } from 'src/common/dto/query.dto';
import { Between, Raw } from 'typeorm';
import { accessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { QueryGetSaleDto } from './dto/queryGetSale.dto';

@Controller('shift')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  // pagination
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.shiftService.findAllWithPagination({
      where: query.query
        ? {
            createdAt: Raw((alias) => `CAST(${alias} AS TEXT) ILike :value`, {
              value: `%${query.query}%`,
            }),
          }
        : {},
      skip: query.page,
      take: query.pageSize,
      relations: { admin: true },
    });
  }

  // src/shifts/shifts.controller.ts
  @Get('for-history')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  async getShifts(@Query() query: PaginationQueryDto & QueryGetSaleDto) {
    const { startDate, endDate } = query;
    const where: any = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Kunning boshi: 00:00:00

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Kunning oxiri: 23:59:59

      where.startTime = Between(start, end);
    }

    return this.shiftService.findAllWithPagination({
      skip: query.page,
      take: query.pageSize,
      relations: {
        admin: true,
        sales: {
          items: { medicine: true },
        },
      },
      where,
      order: { startTime: 'DESC' },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftService.update(id, updateShiftDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftService.delete(id);
  }
}
