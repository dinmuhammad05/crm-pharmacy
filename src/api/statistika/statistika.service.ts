// src/api/statistika/statistika.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Credit, CreditStatus } from 'src/core/entity/credit.entity';
import { Medicine } from 'src/core/entity/medicine.entity';
import { SaleItem } from 'src/core/entity/sale-item.entity';
import { Sale } from 'src/core/entity/sale.entity';
import { Shift } from 'src/core/entity/shift.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatistikaService {
  constructor(
    @InjectRepository(Medicine) private medicineRepo: Repository<Medicine>,
    @InjectRepository(SaleItem) private saleItemRepo: Repository<SaleItem>,
    @InjectRepository(Credit) private creditRepo: Repository<Credit>,
    @InjectRepository(Sale) private saleRepo: Repository<Sale>,
    @InjectRepository(Shift) private shiftRepo: Repository<Shift>,
  ) {}

  async allStatistics() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Umumiy dorilar soni
    const totalMedicines = await this.medicineRepo.count({
      where: { isDeleted: false },
    });

    // 2. Oxirgi sotilgan 5 ta dori
    const last5Sales = await this.saleItemRepo.find({
      relations: ['medicine'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // 3. Eng ko'p qarzi bor debitorlar
    const topDebtor = await this.creditRepo
      .createQueryBuilder('credit')
      .select('credit.customerName', 'name')
      .addSelect('(credit.totalAmount - credit.paidAmount)', 'debt')
      .where('credit.status != :status', { status: CreditStatus.PAID })
      .orderBy('debt', 'DESC')
      .take(5)
      .getRawMany();

    // backend/src/statistics/statistics.service.ts (taxminiy joyi)

    const topSellingMedicines = await this.saleItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.medicine', 'medicine')
      .select('medicine.name', 'name')
      // Logika: Agar dori pachka bo'lsa o'zini qo'sh,
      // agar dona (unit) bo'lsa, uni unitCount ga bo'lib qo'sh.
      .addSelect(
        `SUM(
      CASE 
        WHEN item.type = 'pack' THEN item.amount 
        ELSE CAST(item.amount AS FLOAT) / NULLIF(medicine.unitCount, 0) 
      END
    )`,
        'total_count',
      )
      .groupBy('medicine.id')
      .addGroupBy('medicine.name')
      .orderBy('total_count', 'DESC')
      .take(5)
      .getRawMany();

    // 5. Inventar qiymati (Pachka + Dona hisobida)
    const inventoryData = await this.medicineRepo
      .createQueryBuilder('medicine')
      .select([
        `SUM((medicine.quantity * medicine.originalPrice) + 
         (CASE WHEN medicine.unitCount > 0 THEN (medicine.fractionalQuantity * (medicine.originalPrice / medicine.unitCount)) ELSE 0 END)) AS total_original`,
        `SUM((medicine.quantity * medicine.price) + 
         (CASE WHEN medicine.unitCount > 0 THEN (medicine.fractionalQuantity * (medicine.price / medicine.unitCount)) ELSE 0 END)) AS total_sale`,
      ])
      .where('medicine.isDeleted = false')
      .getRawOne();

    // 6. Haftalik va Oylik savdo
    const lastWeekDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklySales = await this.saleRepo
      .createQueryBuilder('sale')
      .where('sale.createdAt >= :lastWeekDate', { lastWeekDate })
      .select('SUM(sale.totalPrice)', 'total')
      .getRawOne();

    const thisMonthSales = await this.saleRepo
      .createQueryBuilder('sale')
      .where(
        'EXTRACT(MONTH FROM sale.createdAt) = :month AND EXTRACT(YEAR FROM sale.createdAt) = :year',
        { month: currentMonth, year: currentYear },
      )
      .select('SUM(sale.totalPrice)', 'total')
      .getRawOne();

    // 7. Smena hisoboti
    const shiftReport = await this.shiftRepo.find({
      relations: ['admin'],
      order: { startTime: 'DESC' },
      take: 10,
    });

    return {
      totalMedicines,
      last5Sales,
      topDebtor: topDebtor.map((d) => ({
        name: d.name,
        debt: parseFloat(d.debt),
      })),
      topSellingMedicines: topSellingMedicines.map((m) => ({
        name: m.name,
        totalCount: m.total_count,
      })),
      inventoryValue: {
        totalOriginalValue: Math.round(
          parseFloat(inventoryData.total_original || 0),
        ),
        totalSaleValue: Math.round(parseFloat(inventoryData.total_sale || 0)),
        expectedProfit: Math.round(
          parseFloat(inventoryData.total_sale || 0) -
            parseFloat(inventoryData.total_original || 0),
        ),
      },
      weekly: parseFloat(weeklySales.total || 0),
      monthly: parseFloat(thisMonthSales.total || 0),
      shiftReport,
    };
  }
}
