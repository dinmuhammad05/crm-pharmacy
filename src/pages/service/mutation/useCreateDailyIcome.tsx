import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../config';
import { message } from 'antd';

export interface ICreateDailyIncome {
  amount: number;
  incomeDate: string;
  description?: string;
}
export const useCreateDailyIcome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ICreateDailyIncome) => {
      const response = await api.post(
        '/daily-income',
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      // Barcha sotuvlar ro'yxatini yangilash
      queryClient.invalidateQueries({ queryKey: ['daily-income-list'] });
      message.success("Mablag' qo'shildi");
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Xato'),
  });
};
