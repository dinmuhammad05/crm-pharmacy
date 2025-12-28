import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StatistikaService } from './statistika.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { accessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';

@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('statistika')
export class StatistikaController {
  constructor(private readonly statistikaService: StatistikaService) {}

  @Get()
  @accessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @ApiOperation({summary:"all statistics"})
  allStatistics() {
    return this.statistikaService.allStatistics();
  }
 
}
