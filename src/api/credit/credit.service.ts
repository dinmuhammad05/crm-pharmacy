import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCreditDto } from './dto/create-credit.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';
import { BaseService } from 'src/infrastructure/baseService';
import { Credit, CreditStatus } from 'src/core/entity/credit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CreditService extends BaseService<
  CreateCreditDto,
  UpdateCreditDto,
  Credit
> {
  constructor(
    @InjectRepository(Credit) private readonly creditRepo: Repository<Credit>,
  ) {
    super(creditRepo, 'Credit');
  }

  async payPartially(creditId: string, amount: number) {
    const credit = await this.creditRepo.findOne({
      where: { id: creditId },
    });

    if (!credit) {
      throw new NotFoundException('qarz topilmadi');
    }

    const paidAmount = Number(credit.paidAmount);
    const totalAmount = Number(credit.totalAmount);

    if (paidAmount + amount > totalAmount) {
      throw new BadRequestException("To'lov summasi kreditdan oshib ketdi");
    }

    credit.paidAmount = paidAmount + amount;

    const payment = {
      amount,
      date: new Date().toISOString(),
    };

    credit.payments = credit.payments
      ? [...credit.payments, payment]
      : [payment];

    if (credit.paidAmount === totalAmount) {
      credit.status = CreditStatus.PAID;
    } else if (credit.paidAmount > 0) {
      credit.status = CreditStatus.PARTIALLY_PAID;
    }

    return this.creditRepo.save(credit);
  }

  async getTotalUnpaidAmount(): Promise<number> {
    const result = await this.creditRepo
      .createQueryBuilder('credit')
      .select(
        'SUM(credit.totalAmount - COALESCE(credit.paidAmount, 0))',
        'totalDebt',
      )
      .where('credit.status IN (:...statuses)', {
        statuses: [CreditStatus.UNPAID, CreditStatus.PARTIALLY_PAID],
      })
      .getRawOne();

    return Number(result.totalDebt) || 0;
  }
}
