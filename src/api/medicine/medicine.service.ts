import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medicine } from 'src/core/entity/medicine.entity';
import { SupplyHistory } from 'src/core/entity/supply-history.entity';
import { Settings } from 'src/core/entity/settings.entity'; // Settings entity import qilinganiga ishonch hosil qiling
import { BaseService } from 'src/infrastructure/baseService';
import { DataSource, Raw, Repository } from 'typeorm';
import * as xlsx from 'xlsx';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { successRes } from 'src/infrastructure/response/success.response';
import { ISuccess } from 'src/common/interface/ISuccess';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateManyMedicineDto } from './dto/update-many-medicines';
import { SupplyInvoice } from 'src/core/entity/supply-invoice.entity';

// Excel qatorlari uchun interfeys
interface ExcelRow {
  'Номи дору': string;
  Микдор: number;
  Нарх: number;
}

@Injectable()
export class MedicineService extends BaseService<
  CreateMedicineDto,
  UpdateMedicineDto,
  Medicine
> {
  constructor(
    @InjectRepository(Medicine)
    private medicineRepo: Repository<Medicine>,
    @InjectRepository(SupplyHistory)
    private historyRepo: Repository<SupplyHistory>,
    @InjectRepository(Settings)
    private settingsRepo: Repository<Settings>,
    @InjectRepository(SupplyInvoice)
    private suplyInvoiceRepo: Repository<SupplyInvoice>,
    private dataSource: DataSource,
  ) {
    super(medicineRepo, 'medicine');
  }

  // --- YORDAMCHI: Bazadan joriy ustama foizini olish ---
  private async getCurrentMarkup(): Promise<number> {
    const setting = await this.settingsRepo.findOne({
      where: { key: 'global_markup_percent' },
    });

    // Agar bazada sozlama bo'lsa o'shani, bo'lmasa 10% (default) qaytaradi
    if (setting && setting.value) {
      return Number(setting.value);
    }
    return 10;
  }

  // --- 1. EXCEL YUKLASH ---
  async processExcel(file: Express.Multer.File) {
    const currentMarkup = await this.getCurrentMarkup();
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Ma'lumotni massiv (array of arrays) ko'rinishida olamiz - bu boshqarishga oson
    const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const supplyInvoice = await queryRunner.manager.save(
        this.suplyInvoiceRepo.create(),
      );
      let savedCount = 0;

      // 1. Sarlavhalarni aniqlab olamiz (qaysi ustun qayerda?)
      let nameIdx = -1,
        qtyIdx = -1,
        priceIdx = -1;

      // Excelning birinchi 10 qatoridan sarlavhani qidiramiz
      for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const row = rows[i];
        nameIdx = row.findIndex(
          (c) => String(c).includes('Номи') || String(c).includes('Name'),
        );
        qtyIdx = row.findIndex(
          (c) =>
            String(c).includes('Миrдор') ||
            String(c).includes('Кол') ||
            String(c).includes('Qty'),
        );
        priceIdx = row.findIndex(
          (c) =>
            String(c).includes('Нарх') ||
            String(c).includes('Цена') ||
            String(c).includes('Price'),
        );

        if (nameIdx !== -1 && qtyIdx !== -1 && priceIdx !== -1) break;
      }

      if (nameIdx === -1)
        throw new Error('Excel formati mos kelmadi (Sarlavhalar topilmadi)');

      // 2. Ma'lumotlarni aylanamiz
      for (const row of rows) {
        const name = row[nameIdx];
        const qty = Number(row[qtyIdx]);
        const price = Number(row[priceIdx]);

        // FILTR: Agar nomi yo'q bo'lsa yoki miqdori raqam bo'lmasa o'tkazib yuboramiz
        // Bu footerlardagi "Jami summa" degan yozuvlarni dori deb o'ylashdan asraydi
        if (!name || isNaN(qty) || isNaN(price) || qty <= 0) continue;

        // 3. Yaroqlilik muddatini ajratish (RegEx)
        let expiryDate: string | null = null;
        let cleanName = String(name).trim();
        const dateMatch = cleanName.match(/\(([^)]+)\)/); // Qavs ichidagi sanani qidiradi
        if (dateMatch) {
          expiryDate = dateMatch[1] || null;
          cleanName = cleanName.replace(dateMatch[0], '').trim();
        }

        // 4. Save Logic
        const dto: CreateMedicineDto = {
          name: cleanName,
          quantity: qty,
          originalPrice: price,
          expiryDate: expiryDate || '',
        };

        await this.saveMedicineLogic(
          queryRunner,
          dto,
          currentMarkup,
          supplyInvoice,
        );
        savedCount++;
      }

      await queryRunner.commitTransaction();
      return successRes({ count: savedCount, message: 'Import yakunlandi' });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // --- 2. BITTA QO'SHISH ---
  async createOne(dto: CreateMedicineDto) {
    // Agar DTO da foiz kelmasa, bazadagi umumiy foizni olamiz
    const globalMarkup = await this.getCurrentMarkup();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await this.saveMedicineLogic(
        queryRunner,
        dto,
        globalMarkup,
      );
      await queryRunner.commitTransaction();
      return successRes(result);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // --- 3. KO'P QO'SHISH (ARRAY) ---
  async createMany(dtos: CreateMedicineDto[]) {
    const globalMarkup = await this.getCurrentMarkup();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const results: Medicine[] = [];
      for (const dto of dtos) {
        const result = await this.saveMedicineLogic(
          queryRunner,
          dto,
          globalMarkup,
        );
        results.push(result);
      }

      await queryRunner.commitTransaction();
      return successRes({
        count: results.length,
        message: "Barcha dorilar qo'shildi",
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // --- 4. ADMIN SOZLAMASINI O'ZGARTIRISH ---
  async updateGlobalMarkup(percent: number) {
    let setting = await this.settingsRepo.findOne({
      where: { key: 'global_markup_percent' },
    });

    if (!setting) {
      setting = this.settingsRepo.create({
        key: 'global_markup_percent',
        value: String(percent),
      });
    } else {
      setting.value = String(percent);
    }

    const updatingSettings = await this.settingsRepo.save(setting);
    return successRes(updatingSettings);
  }

  // --- 5. UMUMIY MANTIQ (CORE LOGIC) ---
  private async saveMedicineLogic(
    queryRunner: any,
    dto: CreateMedicineDto,
    defaultMarkup: number,
    supplyInvoice?: SupplyInvoice,
  ) {
    const { name, quantity, originalPrice } = dto;
    // 1. Foizni aniqlash:
    // Agar DTO ichida maxsus foiz kelsa (masalan createOne da), o'shani ishlatamiz.
    // Aks holda 'defaultMarkup' (bazadagi global foiz) ishlatiladi.
    const markup =
      dto.markupPercent !== undefined ? dto.markupPercent : defaultMarkup;

    // 2. Sotish narxini hisoblash (FORMULA: Narx * (1 + foiz/100))
    // Masalan: 1000 * (1 + 15/100) = 1150
    let newSellingPrice = originalPrice * (1 + markup / 100);
    newSellingPrice = this.roundTo50(newSellingPrice);
    // Bazadan qidirish
    let medicine = await queryRunner.manager.findOne(Medicine, {
      where: { name: name },
    });

    if (medicine) {
      // A) Dori bor bo'lsa:
      medicine.quantity += quantity; // Sonini qo'shamiz

      // Narxni tekshiramiz: Agar yangi narx QIMMAT bo'lsa, yangilaymiz.
      // Agar eski narx qimmat bo'lsa, tegmaymiz.
      if (newSellingPrice > medicine.price) {
        medicine.price = newSellingPrice;
        medicine.originalPrice = originalPrice; // Kelish narxini ham yangilaymiz
      }
    } else {
      // B) Dori yo'q bo'lsa: Yangi yaratamiz
      medicine = queryRunner.manager.create(Medicine, {
        name: name,
        quantity: quantity,
        originalPrice: originalPrice,
        price: newSellingPrice,
      });
    }

    // Saqlash
    const savedMedicine = await queryRunner.manager.save(medicine);

    // Tarixga yozish
    const history = queryRunner.manager.create(SupplyHistory, {
      addedQuantity: quantity,
      originalPrice: originalPrice,
      price: newSellingPrice, // Qaysi narxda sotuvga chiqqani
      medicine: savedMedicine,
      invoice: supplyInvoice,
    });
    await queryRunner.manager.save(history);

    return savedMedicine;
  }

  async updateSettings(id: string, dto: UpdateSettingsDto): Promise<ISuccess> {
    const setting = await this.settingsRepo.findOne({ where: { id } });
    if (!setting) {
      throw new NotFoundException('Sozlama topilmadi');
    }
    setting.key = dto.key;
    setting.value = dto.value;
    const updatedSetting = await this.settingsRepo.save(setting);
    return successRes(updatedSetting);
  }

  async getSettingsById(id: string): Promise<ISuccess> {
    const setting = await this.settingsRepo.findOne({ where: { id } });
    if (!setting) {
      throw new NotFoundException('Sozlama topilmadi');
    }
    return successRes(setting);
  }

  // bir nechta dorilarni unitCountini update qilish
  async updateMultipleMedicines(
    medicines: UpdateManyMedicineDto[],
  ): Promise<ISuccess> {
    const updatedMedicines: Medicine[] = [];

    for (const medDto of medicines) {
      const medicine = await this.medicineRepo.findOne({
        where: { id: medDto.id },
      });

      if (medicine) {
        medicine.unitCount = medDto.unitCount;
        const updatedMedicine = await this.medicineRepo.save(medicine);
        updatedMedicines.push(updatedMedicine);
      }
    }

    return successRes({
      count: updatedMedicines.length,
      message: 'Dorilar muvaffaqiyatli yangilandi',
    });
  }

  private roundTo50(num: number): number {
    const intPart = Math.floor(num);
    const frac = num - intPart;

    if (frac == 0) {
      return intPart;
    } else if (frac <= 0.5) {
      return intPart + 0.5;
    } else {
      return intPart + 1;
    }
  }

  // medicine.service.ts
  async getSuplyInvoiceWithPagination(
    page?: number,
    pageSize?: number,
    query?: string,
  ) {
    const currentPage = page ?? 1;
    const limit = pageSize ?? 10;

    // findAndCount [ma'lumotlar, jami_soni] ko'rinishida qaytaradi
    const [data, total] = await this.suplyInvoiceRepo.findAndCount({
      relations: { items: { medicine: true } },
      order: { createdAt: 'DESC' },
      skip: (currentPage - 1) * limit,
      take: limit,
      where: query
        ? {
            createdAt: Raw((alias) => `CAST(${alias} AS TEXT) ILIKE :value`, {
              value: `%${query}%`,
            }),
          }
        : undefined,
    });

    return {
      data, // Hozirgi sahifadagi 10 ta invoys
      totalElements: total, // Bazadagi jami invoyslar soni (masalan: 154)
      currentPage,
      pageSize: limit,
    };
  }

  async getInvoiceById(id: string) {
    const response = await this.suplyInvoiceRepo.findOne({
      where: { id },
      relations: { items: { medicine: true } },
    });
    console.log(response);
    return response;
  }
}
