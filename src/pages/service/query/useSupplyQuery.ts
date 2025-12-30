import { useQuery } from '@tanstack/react-query';
import { api } from '../../../config';
import Cookies from 'js-cookie';
import type { ISupplyInvoiceResponse } from '../../type';

export const useSupplyHistory = (params: {
  page?: number;
  pageSize?: number;
  query?: string;
}) => {
  return useQuery({
    queryKey: ['supply-history', params],
    queryFn: async () => {
      const token = Cookies.get('token');
      const res = await api.get<ISupplyInvoiceResponse>(
        `/medicine/supply-history`,
        {
          params,
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    },
  });
};

export const useSupplyInvoiceDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['supply-invoice-detail', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get(`/medicine/supply-history/${id}`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
      });
      return res.data;
    },
    enabled: !!id, // Faqat ID bo'lganda so'rov yuboradi
  });
};