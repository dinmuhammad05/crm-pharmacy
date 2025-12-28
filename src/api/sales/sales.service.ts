// src/module/sales/sales.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import { Medicine } from 'src/core/entity/medicine.entity';
import { Shift } from 'src/core/entity/shift.entity';
import { Sale } from 'src/core/entity/sale.entity';
import { SaleItem, SaleType } from 'src/core/entity/sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { successRes } from 'src/infrastructure/response/success.response';
import { AdminEntity } from 'src/core/entity/admin.entity';
import { BaseService } from 'src/infrastructure/baseService';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Injectable()
export class SalesService extends BaseService<
  CreateSaleDto,
  UpdateSaleDto,
  Sale
> {
  constructor(
    @InjectRepository(Shift) private shiftRepo: Repository<Shift>,
    @InjectRepository(AdminEntity) private adminRepo: Repository<AdminEntity>,
    @InjectRepository(Medicine) private medicineRepo: Repository<Medicine>,
    @InjectRepository(Sale) private saleRepo: Repository<Sale>,
    private dataSource: DataSource,
  ) {
    super(saleRepo, 'sale');
  }

  // 1. Smena holatini tekshirish
  async getActiveShift(adminId: string) {
    const shift = await this.shiftRepo.findOne({
      where: { admin: { id: adminId }, isActive: true, endTime: IsNull() },
    });
    return { isActive: !!shift, shift };
  }

  // 2. Smena ochish
  async startShift(adminId: string) {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin topilmadi');

    const activeShift = await this.shiftRepo.findOne({
      where: { admin: { id: admin.id }, isActive: true },
    });

    if (activeShift)
      throw new BadRequestException('Sizda allaqachon ochiq smena mavjud!');

    const shift = this.shiftRepo.create({
      admin,
      startTime: new Date(),
      totalCash: 0,
      isActive: true,
    });

    return successRes(await this.shiftRepo.save(shift));
  }

  // 3. Smena yopish
  async endShift(adminId: string) {
    const shift = await this.shiftRepo.findOne({
      where: { admin: { id: adminId }, isActive: true },
    });

    if (!shift) throw new BadRequestException('Aktiv smena topilmadi');

    shift.isActive = false;
    shift.endTime = new Date();
    return successRes(await this.shiftRepo.save(shift));
  }

  // 4. Sotuv qilish (Checkout)
  async makeSale(adminId: string, dto: CreateSaleDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const shift = await queryRunner.manager.findOne(Shift, {
        where: { admin: { id: adminId }, isActive: true },
      });
      if (!shift) throw new BadRequestException('Avval smena oching!');

      let systemTotal = 0; // Tizim hisoblagan (asl) summa
      const saleItems: SaleItem[] = [];

      for (const itemDto of dto.items) {
        const medicine = await queryRunner.manager.findOne(Medicine, {
          where: { id: itemDto.medicineId },
        });

        if (!medicine) throw new NotFoundException(`Dori topilmadi`);

        let unitPrice = 0;
        let itemTotal = 0;

        if (itemDto.type === SaleType.PACK) {
          if (medicine.quantity < itemDto.amount)
            throw new BadRequestException(`${medicine.name} yetarli emas`);

          unitPrice = medicine.price;
          itemTotal = unitPrice * itemDto.amount;
          medicine.quantity -= itemDto.amount;
        } else {
          const totalUnits =
            medicine.quantity * medicine.unitCount +
            medicine.fractionalQuantity;
          if (totalUnits < itemDto.amount)
            throw new BadRequestException(`${medicine.name} yetarli emas`);

          unitPrice = medicine.price / medicine.unitCount;
          itemTotal = unitPrice * itemDto.amount;

          const remaining = totalUnits - itemDto.amount;
          medicine.quantity = Math.floor(remaining / medicine.unitCount);
          medicine.fractionalQuantity = remaining % medicine.unitCount;
        }

        systemTotal += itemTotal;

        await queryRunner.manager.save(medicine);
        saleItems.push(
          queryRunner.manager.create(SaleItem, {
            medicine,
            amount: itemDto.amount,
            type: itemDto.type,
            priceAtMoment: unitPrice, // Asl dona narxi
            totalPrice: itemTotal, // Asl jami narxi
          }),
        );
      }

      // MUHIM: Sotuvchi yuborgan narxni (dto.totalPrice) bazaga saqlaymiz
      // Agar farq bo'lsa, bu chegirma sifatida qaraladi
      const sale = await queryRunner.manager.save(Sale, {
        totalPrice: dto.totalPrice, // Real tushgan pul
        systemTotal: systemTotal, // Bo'lishi kerak bo'lgan pul
        shift,
        items: saleItems,
      });

      // Smenadagi kassaga real tushgan pulni qo'shamiz
      shift.totalCash = Number((shift.totalCash + dto.totalPrice).toFixed(2));
      await queryRunner.manager.save(shift);

      await queryRunner.commitTransaction();
      return successRes(sale);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
