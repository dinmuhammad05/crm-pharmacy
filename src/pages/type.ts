export interface IResponse<T> {
  statusCode: number;
  message: {
    uz: string;
    en: string;
    ru: string;
  };
  data: T;
}

export interface IResponseList<T> {
  statusCode: number;
  message: {
    uz: string;
    en: string;
    ru: string;
  };
  data: T[];
}

export interface PaginationResponse<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  pageSize: number;
  currentPage: number;
  from: number;
  to: number;
  statusCode: number;
}

export interface ILoginData {
  username: string;
  password: string;
  role: 'Admin' | 'Teacher';
}

export interface IUser {
  id: string;
  username: string;
  fullName: string;
  url: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILoginData {
  username: string;
  password: string;
}

export interface IResCreateMedicineMany {
  status: string;
  count: number;
  message: string;
  unitCount: number;
}

export interface CreateMedicinePayload {
  name: string;
  quantity: number;
  originalPrice: number;
  expiryDate?: string; // 'YYYY-MM-DD'
  markupPercent?: number; // %
}

export interface IGetListMedicine {
  id: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  originalPrice: number;
  price: number;
  quantity: number;
  expiryDate: string | null;
  unitCount: number;
  fractionalQuantity: number;
}

export interface SearchQueryParams {
  /** Search query */
  query?: string;

  /** Page number (default: 1) */
  page?: number;

  /** Items per page (default: 20) */
  pageSize?: number;
}

export interface IResUpdateUnitCounts {
  count: number;
  message: string;
}

export interface IUpdateMedicineUnitCounts {
  id: string;
  unitCount: number; // Shtuklarda soni
}

export const SaleType = {
  PACK: 'pack',
  UNIT: 'unit',
} as const;

export type SaleType = (typeof SaleType)[keyof typeof SaleType];

// Savatchadagi dori (Frontend uchun)
export interface ICartItem {
  medicine: IGetListMedicine; // IMedicine oldingi kodingizda bor deb hisoblaymiz
  count: number;
  saleType: SaleType;
  currentPrice: number; // O'sha paytdagi narxi (pack yoki unit)
}

// Backendga ketadigan data
export interface ISaleItemPayload {
  medicineId: string | number; // ID raqam yoki string bo'lishi mumkin
  amount: number;
  type: SaleType;
}

export interface ICreateSalePayload {
  items: ISaleItemPayload[];
}

// ============================================
// 1. types/sales.types.ts
// ============================================

// export enum ESaleType {
//   PACK = 'pack',
//   UNIT = 'unit',
// }

export interface ISaleItemDto {
  medicineId: string;
  amount: number;
  type: SaleType;
}

export interface ICreateSaleDto {
  shiftId: string;
  items: ISaleItemDto[];
}

// "histories": [
//       {
//         "id": "6aa301ee-bbeb-4850-8424-be164d2cd3b9",
//         "isActive": true,
//         "isDeleted": false,
//         "createdAt": "2025-12-18T12:42:23.336Z",
//         "updatedAt": "2025-12-18T12:42:23.336Z",
//         "deletedAt": null,
//         "addedQuantity": 2,
//         "originalPrice": 29.4,
//         "price": 32.5
//       }
//     ]
export interface IHistories {
  id: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  addedQuantity: number;
  originalPrice: number;
  price: number;
}

export interface IMedicine {
  id: string;
  name: string;
  originalPrice: number;
  price: number;
  quantity: number;
  fractionalQuantity: number;
  expiryDate: string;
  unitCount: number;
  createdAt: string;
  updatedAt: string;
  histories: IHistories[];
  isActive: boolean;
}

export interface IMedicineUpdatePayload {
  id: string;
  name?: string;
  originalPrice?: number; // Kelish narxi (pachka uchun)
  price?: number; // Sotish narxi (pachka uchun)
  quantity?: number; // BUTUN PACHKALAR SONI (Masalan?: 5 ta pachka)
  fractionalQuantity?: number; // OCHILGAN PACHKADAGI QOLDIQ DONALAR (Masalan?: 7 dona)
  expiryDate?: string;
  unitCount?: number;
}

export interface ISaleItem {
  id: string;
  amount: number;
  type: SaleType;
  priceAtMoment: number;
  totalPrice: number;
  medicine: IMedicine;
  createdAt: string;
  updatedAt: string;
}


export interface IShift {
  id: string;
  startTime: string;
  endTime: string | null;
  totalCash: number;
  admin: IAdmin;
  createdAt: string;
  updatedAt: string;
}

export interface ISale {
  id: string;
  totalPrice: number;
  shift: IShift;
  items: ISaleItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ICreateSaleResponse {
  success: boolean;
  sale: ISale;
  totalPrice: number;
}

export interface ISalesReportResponse {
  sales: ISale[];
  totalRevenue: number;
  totalSales: number;
  period: {
    startDate?: string;
    endDate?: string;
  };
}

export interface ICreditPayment {
  amount: number;
  date: string;
}

export type CreditStatus =
  | 'tolangan'
  | 'tolanmagan'
  | 'qismiTolangan'
  | 'vozKechildi';

export interface ICredit {
  id: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  customerName: string;
  customerPhone: string | null;
  knownAs: string | null;

  totalAmount: string; // decimal string
  paidAmount: string; // decimal string

  payments: ICreditPayment[] | null;

  status: CreditStatus;
  dueDate: string;
}

export interface IUpdateCredit {
  id: string;
  customerName?: string;
  customerPhone?: string;
  knownAs?: string;
  totalAmount?: number;
  dueDate?: string;
  status?: CreditStatus;
}

export interface IDailyIncome {
  id: string;
  amount: number;
  incomeDate: string;
  description: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

// Smena admini uchun tip
export interface IAdmin {
  id: string;
  fullName: string;
  username: string;
}

// Smena hisoboti uchun tip

// Top sotilgan dori uchun tip
export interface ITopSellingMedicine {
  name: string;
  totalCount: string | number; // Postgresdan string bo'lib kelishi mumkin
}

// Qarzdorlik uchun tip
export interface ITopDebtor {
  name: string;
  debt: number;
}

// So'nggi sotuvlar (SaleItem) uchun tip
export interface ILastSale {
  id: string;
  amount: number;
  totalPrice: number;
  createdAt: string;
  medicine?: {
    name: string;
  };
}

// ASOSIY RESPONSE INTERFACE
export interface IStatisticsResponse {
  totalMedicines: number;
  last5Sales: {
    id: string;
    amount: number;
    totalPrice: number;
    createdAt: string;
    medicine?: { name: string };
  }[];
  topDebtor: { name: string; debt: number }[];
  topSellingMedicines: { name: string; totalCount: number }[];
  inventoryValue: {
    totalOriginalValue: number;
    totalSaleValue: number;
    expectedProfit: number;
  };
  weekly: number;
  monthly: number;
  shiftReport: {
    id: string;
    startTime: string;
    totalCash: number;
    admin?: { fullName: string };
  }[];
}

export interface IAdmin{
  id:string
  fullName:string
  username:string
  avatarUrl:string
  url:string
  role:string
  createdAt:string
  updatedAt:string
  isActive:boolean
  isDeleted:boolean
  deletedAt:string

}