// src/module/sales/sales.controller.ts
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { type IToken } from 'src/infrastructure/token/interface';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { accessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('shift/active')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  async getActiveShift(@CurrentUser() user: IToken) {
    return this.salesService.getActiveShift(user.id);
  }


  @Post('shift/start')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  async startShift(@CurrentUser() user: IToken) {
    return this.salesService.startShift(user.id);
  }

  @Post('shift/end')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  async endShift(@CurrentUser() user: IToken) {
    return this.salesService.endShift(user.id);
  }

  @Post('checkout')
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  async makeSale(@CurrentUser() user: IToken, @Body() dto: CreateSaleDto) {
    return this.salesService.makeSale(user.id, dto);
  }
}
