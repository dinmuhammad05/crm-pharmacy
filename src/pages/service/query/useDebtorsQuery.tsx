import { useQuery } from '@tanstack/react-query';
import { api } from '../../../config';
import type { ICredit, IResponse,  } from '../../type';

export interface IResponseListDebtor<T> {
  statusCode: number;
  message: {
    uz: string;
    en: string;
    ru: string;
  };
  data: {
    list: T[];
    sum?: number; // Qarzdorlar uchun umumiy summa
    total?: number; // Agar pagination bo'lsa
  };
}

export const useDebtorsList = () => {
  return useQuery({
    queryKey: ['debtors'],
    queryFn: async () => {
      const response = await api.get<IResponseListDebtor<ICredit>>('/credit');
      return response.data;
    },
  });
};

export const useDebtorsDetail = (id: string) => {
  return useQuery({
    queryKey: ['debtorDetail', id],
    queryFn: async () => {
      const response = await api.get<IResponse<ICredit>>('/credit/' + id);
      return response.data;
    },
  });
};
