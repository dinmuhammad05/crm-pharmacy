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
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { accessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';

@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Expense')
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @ApiOperation({ summary: 'Harajat qo‘shish' })
  @ApiResponse({ status: 201, description: 'Harajat muvaffaqiyatli qo‘shildi' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(createExpenseDto);
  }

  @ApiOperation({ summary: 'Barcha harajatlar ro‘yxati' })
  @ApiResponse({ status: 200, description: 'Harajatlar ro‘yxati' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @Get()
  findAll() {
    return this.expenseService.findAll();
  }

  @ApiOperation({ summary: 'ID bo‘yicha harajatni olish' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Topilgan harajat' })
  @ApiResponse({ status: 404, description: 'Harajat topilmadi' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.expenseService.findOneById(id);
  }

  @ApiOperation({ summary: 'Harajatni yangilash' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Harajat yangilandi' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(id, updateExpenseDto);
  }

  @ApiOperation({ summary: 'Harajatni o‘chirish' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, description: 'Harajat o‘chirildi' })
  @accessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.expenseService.delete(id);
  }
}
