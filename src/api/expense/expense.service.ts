import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { BaseService } from 'src/infrastructure/baseService';
import { Expense } from 'src/core/entity/expense.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ExpenseService extends BaseService<
  CreateExpenseDto,
  UpdateExpenseDto,
  Expense
> {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
  ) {
    super(expenseRepo, 'expense');
  }
}
