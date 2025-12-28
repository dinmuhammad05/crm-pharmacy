export type SaleType = 'pack' | 'unit';


export interface MedicineHistory {
  id: string;
  name: string;
  price: number;
}

export interface SaleItemHistory {
  id: string;
  amount: number;
  type: SaleType;
  priceAtMoment: number;
  totalPrice: number;
  medicine: MedicineHistory;
}

export interface SaleHistory {
  id: string;
  totalPrice: number;
  createdAt: string;
  items: SaleItemHistory[];
}

export interface AdminHistory {
  id: string;
  fullName: string;
  username: string;
}

export interface ShiftHistory {
  id: string;
  startTime: string;
  endTime: string | null;
  totalCash: number;
  admin: AdminHistory;
  sales: SaleHistory[];
}

import { useQuery } from "@tanstack/react-query";
import { api } from "../../../config";
import type { PaginationResponse } from "../../type";


export interface ShiftQueryParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}

export const useShifts = (params: ShiftQueryParams) => {
  return useQuery({
    queryKey: ['shifts', params],
    queryFn: async () => {
      const response = await api.get<PaginationResponse<ShiftHistory>>('/shift/for-history', { 
        params: {
            ...params,
            // Backend kutilayotgan formatga o'tkazish
            startDate: params.startDate || undefined,
            endDate: params.endDate || undefined
        } 
      });
      return response.data;
    },
  });
};