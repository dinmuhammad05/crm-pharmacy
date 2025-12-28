import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IResponse, IUpdateCredit } from '../../type';
import { api } from '../../../config';

type ICreateCredit = Required<IUpdateCredit>;

export const useDebtorsUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: IUpdateCredit) => {
      const { id, ...rest } = data;
      const response = await api.patch<IResponse<IUpdateCredit>>(
        `/credit/${data.id}`,
        rest,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debtorDetail'] });
    },
  });
};

export const useDebtorsCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: IUpdateCredit) => {
      const response = await api.post<IResponse<ICreateCredit>>(
        '/credit',
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debtors'] });
    },
  });
};

// creditni qisman to'lov qilish
export const useDebtorsPay = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number }) => {
      const response = await api.patch<IResponse<IUpdateCredit>>(
        `/credit/${id}/pay`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debtorDetail'] });
    },
  });
};

// delete qilish
export const useDebtorsDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/credit/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debtors'] });
    },
  });
};
