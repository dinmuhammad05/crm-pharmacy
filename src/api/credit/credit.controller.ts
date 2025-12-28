import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreditService } from './credit.service';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';
import { PayPartiallyDto } from './dto/pay-partially.dto';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { accessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';

@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Credit')
@Controller('credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @ApiOperation({ summary: 'Nasiya (kredit) qoshish' })
  @ApiResponse({ status: 201, description: 'Kredit muvaffaqiyatli qoshildi' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @Post()
  create(@Body() createCreditDto: CreateCreditDto) {
    return this.creditService.create(createCreditDto);
  }

  @ApiOperation({ summary: 'Barcha nasiyalar (kreditlar) royxati' })
  @ApiResponse({ status: 200, description: 'Kreditlar royxati' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @Get()
  async findAll() {
    const response = await this.creditService.findAll();
    const sum = await this.creditService.getTotalUnpaidAmount();

    return {
      ...response,
      data: {
        list: response.data,
        sum,
      },
    };
  }

  @ApiOperation({ summary: 'ID boyicha kreditni olish' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Topilgan kredit' })
  @ApiResponse({ status: 404, description: 'Kredit topilmadi' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.creditService.findOneById(id);
  }

  @ApiOperation({ summary: 'Kreditni yangilash' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Kredit yangilandi' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCreditDto: UpdateCreditDto,
  ) {
    return this.creditService.update(id, updateCreditDto);
  }

  @ApiOperation({ summary: 'Kreditga qisman tolov qoshish' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Tolov muvaffaqiyatli qoshildi' })
  @ApiResponse({
    status: 400,
    description: 'Tolov summasi kreditdan oshib ketdi',
  })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @Patch(':id/pay')
  payPartially(
    @Param('id') id: string,
    @Body() payPartiallyDto: PayPartiallyDto,
  ) {
    return this.creditService.payPartially(id, payPartiallyDto.amount);
  }

  @ApiOperation({ summary: 'Kreditni ochirish' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Kredit ochirildi' })
  @accessRoles(Roles.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.creditService.delete(id);
  }
}
