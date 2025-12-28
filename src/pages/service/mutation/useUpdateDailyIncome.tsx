import { useMutation } from '@tanstack/react-query';
import { api } from '../../../config';
import type { ICreateDailyIncome } from './useCreateDailyIcome';

type Type = Partial<ICreateDailyIncome> & {
  id: string;
};

export const useUpdateDailyIncome = () => {
  return useMutation({
    mutationFn: async (data: Type) => {
        const { id, ...rest } = data
      const response = await api.patch(`/daily-income/${id}`, rest);
      return response.data;
    },
  });
};
