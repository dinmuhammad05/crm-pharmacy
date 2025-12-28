import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credit } from 'src/core/entity/credit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credit])],
  controllers: [CreditController],
  providers: [CreditService],
})
export class CreditModule {}
