import { Injectable } from '@nestjs/common';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { BaseService } from 'src/infrastructure/baseService';
import { Shift } from 'src/core/entity/shift.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ShiftService extends BaseService<CreateShiftDto, UpdateShiftDto, Shift> {
  constructor(
    @InjectRepository(Shift) private readonly shiftRepo: Repository<Shift>,
  ) {
    super(shiftRepo, 'shift');
  }

}
